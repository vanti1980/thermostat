import cyclicDb from 'cyclic-dynamodb';
import {
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarWeeks,
  format,
  formatISO,
  getDate,
  getDay,
  isAfter,
  isBefore,
  parseISO,
  set
} from 'date-fns';
import express from 'express';
const db = cyclicDb()('taupe-hermit-crab-togaCyclicDB');
const app = express();

const COLL_ID = 'id';
// key: <ID>_YYYYMMDD, value: [{"1005":21.5,"1010":21.75}]
// each day a JSON string of 24*12=288 entries (with 5 min refresh), ca. 12*288=3500 bytes
// collection would yearly contain (per ID) 365 entries = 365 * (50 + 3500) = ca. 1.3 MB
const COLL_STATUS = 'status';

// in order to be able to query exactly the days which are present (to not get keys which are not available)
// key: <ID>_YYYY, value: ["20221001","20221002"]
// collection would contain (per ID) 1 entry per year = 365 * 11 + 2 = 4017 bytes
// const COLL_STATUS_DAYS = 'statusDays';

// key: <ID>_<UUID>, value: {"from":"2022-10-03T10:00:00Z","priority":1,"set":19,"rUnit":"w","rDays":[0,1,2,3,4],"rFrom":"0700","rTo":"1700"} -> for recurring setting
// key: <ID>_<UUID>, value: {"from":"2022-10-03T10:00:00Z","to":"2022-10-03T16:00:00Z","priority":10,"set":21} -> for one-time setting
const COLL_SCHEDULE = 'schedule';

/**
 * Handles when a new ID is created.
 *
 * @param {Request} req
 * @param {Response} res
 */
 const createId = async (req, res) => {
  // create new auth ID
  console.log(req.body);
  await db.collection(COLL_ID).set(req.body, {});

  res.status(201).end();
};

/**
 * Handles when thermostat send a status.
 *
 * @param {Request} req
 * @param {Response} res
 */
const postStatus = async (req, res) =>
  withValidId(req, res, async (req, res, id) => {
    const now = new Date();
    const key = `${id}_${format(now, 'yyyyMMdd')}`;
    const statusColl = db.collection(COLL_STATUS);
    const item = await statusColl.get(key);
    let props = item.props;
    if (!props) {
      props = {};
    }
    props[format(now, 'HHmm')] = req.body.temp;
    await statusColl.set(key, props);
    const schedule = getEffectiveSchedule(id);
    res
      .json({
        temp: req.body.temp,
        ts: formatISO(now),
        schedule
      })
      .end();
  });

/**
 * Handles when thermostat send a status.
 *
 * @param {Request} req
 * @param {Response} res
 */
const getSchedules = async (req, res) =>
  withValidId(req, res, (req, res, id) => {
    res.json(getActiveSchedules(id)).end();
  });

const getEffectiveSchedule = async (id) => {
  const schedules = getActiveSchedules(id);
  return schedules.pop();
};

/**
 * Returns schedules in effect.
 *
 * @param {string} id Thermostat ID
 * @returns {Promise<Schedule[]>}
 */
const getActiveSchedules = async (id) => {
  // TODO solve with filter
  const scheduleItems = await db.collection(COLL_SCHEDULE).list();
  const schedules = scheduleItems.results.filter((item) =>
    item.key.startsWith(`${id}_`)
  );
  schedules.sort((a, b) => a.props.priority - b.props.priority);
  const now = new Date();
  return schedules.results
    .map((schedule) => ({ id: schedule.id, ...schedule.props }))
    .filter(
      (props) =>
        (!props.from || !isAfter(parseISO(props.from), now)) &&
        (!props.to || !isBefore(parseISO(props.to), now))
    )
    .filter(
      (props) =>
        !props.rUnit ||
        recurringToday(
          now,
          props.from,
          props.rUnit,
          props.rCount,
          props.rFrom,
          props.rTo
        ) ||
        recurringThisWeek(
          now,
          props.from,
          props.rUnit,
          props.rCount,
          props.rDays,
          props.rFrom,
          props.rTo
        ) ||
        recurringThisMonth(
          now,
          props.from,
          props.rUnit,
          props.rCount,
          props.rDays,
          props.rFrom,
          props.rTo
        )
    );
};

/**
 *
 * @param {Date} now
 * @param {string} rFrom
 * @param {string} rTo
 * @returns {boolean}
 */
const inHourMinInterval = (now, rFrom, rTo) =>
  isBefore(todayHoursMins(rFrom), now) && isAfter(todayHoursMins(rTo));

/**
 *
 * @param {Date} now
 * @param {Date} from
 * @param {'d'|'w'|'m'} rUnit Unit
 * @param {number} rCount
 * @param {string} rFrom
 * @param {string} rTo
 * @returns {boolean}
 */
const recurringToday = (now, from, rUnit, rCount, rFrom, rTo) =>
  rUnit === 'd' &&
  differenceInCalendarDays(now, from) % (rCount || 1) === 0 &&
  inHourMinInterval(now, rFrom, rTo);

/**
 *
 * @param {Date} now
 * @param {Date} from
 * @param {'d'|'w'|'m'} rUnit Unit
 * @param {number} rCount
 * @param {Array<number>} rDays
 * @param {string} rFrom
 * @param {string} rTo
 * @returns {boolean}
 */
const recurringThisWeek = (now, from, rUnit, rCount, rDays, rFrom, rTo) =>
  rUnit === 'w' &&
  differenceInCalendarWeeks(now, from) % (rCount || 1) === 0 &&
  (rDays || []).includes(getDay(now)) &&
  inHourMinInterval(now, rFrom, rTo);

/**
 *
 * @param {Date} now
 * @param {Date} from
 * @param {'d'|'w'|'m'} rUnit Unit
 * @param {number} rCount
 * @param {Array<number>} rDays
 * @param {string} rFrom
 * @param {string} rTo
 * @returns {boolean}
 */
const recurringThisMonth = (now, from, rUnit, rCount, rDays, rFrom, rTo) =>
  rUnit === 'm' &&
  differenceInCalendarMonths(now, from) % (rCount || 1) === 0 &&
  (rDays || []).includes(getDate(now)) &&
  inHourMinInterval(now, rFrom, rTo);

/**
 *
 * @param {string} hourMin
 * @returns {Date}
 */
const todayHoursMins = (hourMin) =>
  set(new Date(), {
    hours: hourMin.substring(0, 2),
    minutes: hourMin.substring(2, 4)
  });

/**
 * Calls callback if ID is valid
 * @param {Request} req
 * @param {Response} res
 * @param {Function} cbValid
 */
const withValidId = async (req, res, cbValid) => {
  const id = req.headers['id'];
  const entry = await db.collection(COLL_ID).get(id);
  if (entry) {
    await cbValid(req, res, id);
  } else {
    res.status(400).end();
  }
};


app.use(express.json());
app.use(express.text({type: 'text/plain'}));
app.use(express.urlencoded({ extended: true }));

// #############################################################################
// This configures static hosting for files in /public that have the extensions
// listed in the array.
const options = {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['htm', 'html', 'css', 'js', 'ico', 'jpg', 'jpeg', 'png', 'svg'],
  index: ['index.html'],
  maxAge: '1m',
  redirect: false
};
app.use(express.static('public', options));
// #############################################################################

app.post('/id', createId);
app.post('/status', postStatus);
app.get('/schedules', getSchedules);

/*
// Delete an item
app.delete('/:col/:key', async (req, res) => {
  const col = req.params.col;
  const key = req.params.key;
  console.log(
    `from collection: ${col} delete key: ${key} with params ${JSON.stringify(
      req.params
    )}`
  );
  const item = await db.collection(col).delete(key);
  console.log(JSON.stringify(item, null, 2));
  res.json(item).end();
});

// Get a single item
app.get('/:col/:key', async (req, res) => {
  const col = req.params.col;
  const key = req.params.key;
  console.log(
    `from collection: ${col} get key: ${key} with params ${JSON.stringify(
      req.params
    )}`
  );
  const item = await db.collection(col).get(key);
  console.log(JSON.stringify(item, null, 2));
  res.json(item).end();
});

// Get a full listing
app.get('/:col', async (req, res) => {
  const col = req.params.col;
  console.log(
    `list collection: ${col} with params: ${JSON.stringify(req.params)}`
  );
  const items = await db.collection(col).list();
  console.log(JSON.stringify(items, null, 2));
  res.json(items).end();
});
*/

// Catch all handler for all other request.
app.use('*', (req, res) => {
  res.json({ msg: 'no route handler found' }).end();
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`index.js listening on ${port}`);
});

