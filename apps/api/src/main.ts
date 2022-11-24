import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { IdController } from './app/id/id.controller';
import { IdService } from './app/id/id.service';
import { ScheduleController } from './app/schedule/schedule.controller';
import { ScheduleService } from './app/schedule/schedule.service';
import { StatusController } from './app/status/status.controller';
import { StatusService } from './app/status/status.service';

const app = express();
app.use(cors());

const options = {
  dotfiles: 'ignore',
  etag: true,
  extensions: ['htm', 'html', 'css', 'js', 'ico', 'jpg', 'jpeg', 'png', 'svg'],
  index: ['index.html'],
  maxAge: '1m',
  redirect: true,
};

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      },
    },
  }),
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // limit each IP to 100 requests per windowMs
  }),
);

const idSvc = new IdService();
const scheduleSvc = new ScheduleService();

new IdController(app, idSvc);
new ScheduleController(app, idSvc, scheduleSvc);
new StatusController(app, idSvc, new StatusService(scheduleSvc));

app.use(express.static('dist/public', options));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
