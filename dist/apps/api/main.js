/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./apps/api/src/app/app.module.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const tslib_1 = __webpack_require__("tslib");
const common_1 = __webpack_require__("@nestjs/common");
const config_1 = __webpack_require__("@nestjs/config");
const serve_static_1 = __webpack_require__("@nestjs/serve-static");
const path = __webpack_require__("path");
const id_module_1 = __webpack_require__("./apps/api/src/app/id/id.module.ts");
const schedule_module_1 = __webpack_require__("./apps/api/src/app/schedule/schedule.module.ts");
const status_module_1 = __webpack_require__("./apps/api/src/app/status/status.module.ts");
let AppModule = class AppModule {
};
AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: path.join(__dirname, '..', 'web'),
                exclude: ['/api*'],
                serveStaticOptions: {
                    dotfiles: 'ignore',
                    etag: false,
                    extensions: [
                        'htm',
                        'html',
                        'css',
                        'js',
                        'ico',
                        'jpg',
                        'jpeg',
                        'png',
                        'svg',
                    ],
                    index: ['index.html'],
                    maxAge: '1m',
                    redirect: false,
                },
            }),
            config_1.ConfigModule.forRoot(),
            // AuthModule,
            // LogsModule,
            id_module_1.IdModule,
            schedule_module_1.ScheduleModule,
            status_module_1.StatusModule,
        ],
    })
], AppModule);
exports.AppModule = AppModule;


/***/ }),

/***/ "./apps/api/src/app/id/id.controller.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var IdController_1, _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IdController = void 0;
const tslib_1 = __webpack_require__("tslib");
const common_1 = __webpack_require__("@nestjs/common");
const id_service_1 = __webpack_require__("./apps/api/src/app/id/id.service.ts");
let IdController = IdController_1 = class IdController {
    constructor(idService) {
        this.idService = idService;
        this.logger = new common_1.Logger(IdController_1.name);
    }
    getIds() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.idService.getIds().catch((err) => {
                this.logger.error(`Could not query IDs`, err);
                throw new common_1.HttpException(`Could not query IDs`, common_1.HttpStatus.BAD_REQUEST);
            });
        });
    }
    createId(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.idService.createId(id).catch((err) => {
                this.logger.error(`Could not create ID ${id}`, err);
                throw new common_1.HttpException(`Could not create ID ${id}`, common_1.HttpStatus.BAD_REQUEST);
            });
        });
    }
};
tslib_1.__decorate([
    (0, common_1.Get)(''),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", typeof (_a = typeof Promise !== "undefined" && Promise) === "function" ? _a : Object)
], IdController.prototype, "getIds", null);
tslib_1.__decorate([
    (0, common_1.Post)(''),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], IdController.prototype, "createId", null);
IdController = IdController_1 = tslib_1.__decorate([
    (0, common_1.Controller)('id'),
    tslib_1.__metadata("design:paramtypes", [typeof (_c = typeof id_service_1.IdService !== "undefined" && id_service_1.IdService) === "function" ? _c : Object])
], IdController);
exports.IdController = IdController;


/***/ }),

/***/ "./apps/api/src/app/id/id.module.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IdModule = void 0;
const tslib_1 = __webpack_require__("tslib");
const common_1 = __webpack_require__("@nestjs/common");
const id_controller_1 = __webpack_require__("./apps/api/src/app/id/id.controller.ts");
const id_service_1 = __webpack_require__("./apps/api/src/app/id/id.service.ts");
let IdModule = class IdModule {
};
IdModule = tslib_1.__decorate([
    (0, common_1.Module)({
        controllers: [id_controller_1.IdController],
        providers: [id_service_1.IdService],
        exports: [id_service_1.IdService],
    })
], IdModule);
exports.IdModule = IdModule;


/***/ }),

/***/ "./apps/api/src/app/id/id.service.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IdService = void 0;
const tslib_1 = __webpack_require__("tslib");
const common_1 = __webpack_require__("@nestjs/common");
const db = __webpack_require__("cyclic-dynamodb");
const COLL_ID = 'id';
let IdService = class IdService {
    getIds() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = (yield db.collection(COLL_ID).list());
            return list.results.map(item => item.key);
        });
    }
    createId(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield db.collection(COLL_ID).set(id, {});
        });
    }
    /**
     * Calls callback if ID is valid
     * @param id
     */
    checkValidId(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const entry = yield db.collection(COLL_ID).get(id);
            if (!entry) {
                throw new common_1.HttpException('Invalid Id', common_1.HttpStatus.BAD_REQUEST);
            }
        });
    }
    ;
};
IdService = tslib_1.__decorate([
    (0, common_1.Injectable)()
], IdService);
exports.IdService = IdService;


/***/ }),

/***/ "./apps/api/src/app/schedule/schedule.controller.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ScheduleController = void 0;
const tslib_1 = __webpack_require__("tslib");
const _models_1 = __webpack_require__("./libs/models/src/index.ts");
const common_1 = __webpack_require__("@nestjs/common");
const id_service_1 = __webpack_require__("./apps/api/src/app/id/id.service.ts");
const schedule_service_1 = __webpack_require__("./apps/api/src/app/schedule/schedule.service.ts");
let ScheduleController = class ScheduleController {
    constructor(idSvc, scheduleSvc) {
        this.idSvc = idSvc;
        this.scheduleSvc = scheduleSvc;
    }
    getSchedules(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.idSvc
                .checkValidId(id)
                .then(() => this.scheduleSvc.getSchedules(id));
        });
    }
    createSchedule(id, scheduleRequest) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.idSvc
                .checkValidId(id)
                .then(() => this.scheduleSvc.createSchedule(id, scheduleRequest));
        });
    }
    deleteSchedule(id, scheduleId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.idSvc
                .checkValidId(id)
                .then(() => this.scheduleSvc.deleteSchedule(scheduleId));
        });
    }
    updateSchedule(id, scheduleId, schedule) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.idSvc
                .checkValidId(id)
                .then(() => this.scheduleSvc.updateSchedule(scheduleId, schedule));
        });
    }
};
tslib_1.__decorate([
    (0, common_1.Get)(''),
    tslib_1.__param(0, (0, common_1.Headers)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_a = typeof Promise !== "undefined" && Promise) === "function" ? _a : Object)
], ScheduleController.prototype, "getSchedules", null);
tslib_1.__decorate([
    (0, common_1.Post)(''),
    tslib_1.__param(0, (0, common_1.Headers)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_b = typeof _models_1.ScheduleRequest !== "undefined" && _models_1.ScheduleRequest) === "function" ? _b : Object]),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], ScheduleController.prototype, "createSchedule", null);
tslib_1.__decorate([
    (0, common_1.Delete)(':scheduleId'),
    tslib_1.__param(0, (0, common_1.Headers)('id')),
    tslib_1.__param(1, (0, common_1.Param)('scheduleId')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], ScheduleController.prototype, "deleteSchedule", null);
tslib_1.__decorate([
    (0, common_1.Put)(':scheduleId'),
    tslib_1.__param(0, (0, common_1.Headers)('id')),
    tslib_1.__param(1, (0, common_1.Param)('scheduleId')),
    tslib_1.__param(2, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, typeof (_e = typeof _models_1.Schedule !== "undefined" && _models_1.Schedule) === "function" ? _e : Object]),
    tslib_1.__metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], ScheduleController.prototype, "updateSchedule", null);
ScheduleController = tslib_1.__decorate([
    (0, common_1.Controller)('schedules'),
    tslib_1.__metadata("design:paramtypes", [typeof (_g = typeof id_service_1.IdService !== "undefined" && id_service_1.IdService) === "function" ? _g : Object, typeof (_h = typeof schedule_service_1.ScheduleService !== "undefined" && schedule_service_1.ScheduleService) === "function" ? _h : Object])
], ScheduleController);
exports.ScheduleController = ScheduleController;


/***/ }),

/***/ "./apps/api/src/app/schedule/schedule.module.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ScheduleModule = void 0;
const tslib_1 = __webpack_require__("tslib");
const common_1 = __webpack_require__("@nestjs/common");
const id_module_1 = __webpack_require__("./apps/api/src/app/id/id.module.ts");
const schedule_controller_1 = __webpack_require__("./apps/api/src/app/schedule/schedule.controller.ts");
const schedule_service_1 = __webpack_require__("./apps/api/src/app/schedule/schedule.service.ts");
let ScheduleModule = class ScheduleModule {
};
ScheduleModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [id_module_1.IdModule],
        controllers: [schedule_controller_1.ScheduleController],
        providers: [schedule_service_1.ScheduleService],
        exports: [schedule_service_1.ScheduleService],
    })
], ScheduleModule);
exports.ScheduleModule = ScheduleModule;


/***/ }),

/***/ "./apps/api/src/app/schedule/schedule.service.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var ScheduleService_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ScheduleService = void 0;
const tslib_1 = __webpack_require__("tslib");
const common_1 = __webpack_require__("@nestjs/common");
const db = __webpack_require__("cyclic-dynamodb");
const uuid_1 = __webpack_require__("uuid");
const date_fns_1 = __webpack_require__("date-fns");
// in order to be able to query exactly the days which are present (to not get keys which are not available)
// key: <ID>_YYYY, value: ["20221001","20221002"]
// collection would contain (per ID) 1 entry per year = 365 * 11 + 2 = 4017 bytes
// const COLL_STATUS_DAYS = 'statusDays';
// key: <ID>_<UUID>, value: {"from":"2022-10-03T10:00:00Z","priority":1,"set":19,"rUnit":"w","rDays":[0,1,2,3,4],"rFrom":"0700","rTo":"1700"} -> for recurring setting
// key: <ID>_<UUID>, value: {"from":"2022-10-03T10:00:00Z","to":"2022-10-03T16:00:00Z","priority":10,"set":21} -> for one-time setting
const COLL_SCHEDULE = 'schedule';
let ScheduleService = ScheduleService_1 = class ScheduleService {
    constructor() {
        this.logger = new common_1.Logger(ScheduleService_1.name);
    }
    /**
     * Handles when thermostat send a status.
     *
     * @param {Request} req
     * @param {Response} res
     */
    getSchedules(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.getActiveSchedules(id);
        });
    }
    createSchedule(id, request) {
        var _a, _b, _c, _d, _e;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // key: <ID>_<UUID>, value: {"from":"2022-10-03T10:00:00Z","priority":1,"set":19,"rUnit":"w","rDays":[0,1,2,3,4],"rFrom":"0700","rTo":"1700"} -> for recurring setting
            const key = `${id}_${(0, uuid_1.v4)()}`;
            const priority = (yield db.collection(COLL_SCHEDULE).list()).results.length + 1;
            yield db.collection(COLL_SCHEDULE).set(key, {
                from: request.from,
                to: request.to,
                priority,
                set: request.set,
                rUnit: (_a = request.recurring) === null || _a === void 0 ? void 0 : _a.unit,
                rCount: (_b = request.recurring) === null || _b === void 0 ? void 0 : _b.count,
                rDays: (_c = request.recurring) === null || _c === void 0 ? void 0 : _c.days,
                rFrom: (_d = request.recurring) === null || _d === void 0 ? void 0 : _d.from,
                rTo: (_e = request.recurring) === null || _e === void 0 ? void 0 : _e.to,
            });
            return Object.assign(Object.assign({}, request), { id: key, priority });
        });
    }
    deleteSchedule(scheduleId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const schedule = yield db.collection(COLL_SCHEDULE).delete(scheduleId);
            if (!schedule) {
                throw new common_1.HttpException(`Could not delete schedule with ID ${scheduleId}`, common_1.HttpStatus.NOT_FOUND);
            }
        });
    }
    updateSchedule(scheduleId, request) {
        var _a, _b, _c, _d, _e;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // key: <ID>_<UUID>, value: {"from":"2022-10-03T10:00:00Z","priority":1,"set":19,"rUnit":"w","rDays":[0,1,2,3,4],"rFrom":"0700","rTo":"1700"} -> for recurring setting
            const schedule = yield db.collection(COLL_SCHEDULE).get(scheduleId);
            if (!schedule) {
                throw new common_1.HttpException(`Could not find schedule with ID ${scheduleId}`, common_1.HttpStatus.NOT_FOUND);
            }
            const updatedSchedule = Object.assign(Object.assign({}, schedule), { from: request.from, to: request.to, set: request.set, rUnit: (_a = request.recurring) === null || _a === void 0 ? void 0 : _a.unit, rCount: (_b = request.recurring) === null || _b === void 0 ? void 0 : _b.count, rDays: (_c = request.recurring) === null || _c === void 0 ? void 0 : _c.days, rFrom: (_d = request.recurring) === null || _d === void 0 ? void 0 : _d.from, rTo: (_e = request.recurring) === null || _e === void 0 ? void 0 : _e.to });
            yield db.collection(COLL_SCHEDULE).set(scheduleId, updatedSchedule);
            return updatedSchedule;
        });
    }
    /**
     * Returns schedules in effect.
     *
     * @param {string} id Thermostat ID
     * @returns {Promise<Schedule[]>}
     */
    getActiveSchedules(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // TODO solve with filter
            const briefScheduleItems = yield db.collection(COLL_SCHEDULE).list();
            const briefSchedules = briefScheduleItems.results.filter((item) => item.key.startsWith(`${id}_`));
            const schedules = yield Promise.all(briefSchedules.map((sch) => db.collection(COLL_SCHEDULE).get(sch.key)));
            schedules.sort((a, b) => a.props.priority - b.props.priority);
            const now = new Date();
            return (schedules || [])
                .map((schedule) => (Object.assign({ id: schedule.key }, schedule.props)))
                .filter((props) => (!props.from || !(0, date_fns_1.isAfter)((0, date_fns_1.parseISO)(props.from), now)) &&
                (!props.to || !(0, date_fns_1.isBefore)((0, date_fns_1.parseISO)(props.to), now)))
                .filter((props) => !props.rUnit ||
                this.recurringToday(now, (0, date_fns_1.parseISO)(props.from), props.rUnit, props.rCount, props.rFrom, props.rTo) ||
                this.recurringThisWeek(now, (0, date_fns_1.parseISO)(props.from), props.rUnit, props.rCount, props.rDays, props.rFrom, props.rTo) ||
                this.recurringThisMonth(now, (0, date_fns_1.parseISO)(props.from), props.rUnit, props.rCount, props.rDays, props.rFrom, props.rTo));
        });
    }
    /**
     *
     * @param {string} id
     * @returns {Promise<Schedule | undefined>}
     */
    getEffectiveSchedule(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const schedules = yield this.getActiveSchedules(id);
            return schedules.pop();
        });
    }
    /**
     *
     * @param {Date} now
     * @param {string} rFrom
     * @param {string} rTo
     * @returns {boolean}
     */
    inHourMinInterval(now, rFrom, rTo) {
        return ((0, date_fns_1.isBefore)(this.todayHoursMins(rFrom), now) &&
            (0, date_fns_1.isAfter)(this.todayHoursMins(rTo), now));
    }
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
    recurringToday(now, from, rUnit, rCount, rFrom, rTo) {
        return (rUnit === 'd' &&
            (0, date_fns_1.differenceInCalendarDays)(now, from) % (rCount || 1) === 0 &&
            this.inHourMinInterval(now, rFrom, rTo));
    }
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
    recurringThisWeek(now, from, rUnit, rCount, rDays, rFrom, rTo) {
        return (rUnit === 'w' &&
            (0, date_fns_1.differenceInCalendarWeeks)(now, from) % (rCount || 1) === 0 &&
            (rDays || []).includes((0, date_fns_1.getDay)(now)) &&
            this.inHourMinInterval(now, rFrom, rTo));
    }
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
    recurringThisMonth(now, from, rUnit, rCount, rDays, rFrom, rTo) {
        return (rUnit === 'm' &&
            (0, date_fns_1.differenceInCalendarMonths)(now, from) % (rCount || 1) === 0 &&
            (rDays || []).includes((0, date_fns_1.getDate)(now)) &&
            this.inHourMinInterval(now, rFrom, rTo));
    }
    /**
     *
     * @param {string} hourMin
     * @returns {Date}
     */
    todayHoursMins(hourMin) {
        return (0, date_fns_1.set)(new Date(), {
            hours: +hourMin.substring(0, 2),
            minutes: +hourMin.substring(2, 4),
        });
    }
};
ScheduleService = ScheduleService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [])
], ScheduleService);
exports.ScheduleService = ScheduleService;


/***/ }),

/***/ "./apps/api/src/app/status/status.controller.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StatusController = void 0;
const tslib_1 = __webpack_require__("tslib");
const _models_1 = __webpack_require__("./libs/models/src/index.ts");
const common_1 = __webpack_require__("@nestjs/common");
const id_service_1 = __webpack_require__("./apps/api/src/app/id/id.service.ts");
const status_service_1 = __webpack_require__("./apps/api/src/app/status/status.service.ts");
let StatusController = class StatusController {
    constructor(idSvc, statusSvc) {
        this.idSvc = idSvc;
        this.statusSvc = statusSvc;
    }
    getStatus(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.idSvc.checkValidId(id).then(() => this.statusSvc.getStatus(id));
        });
    }
    postStatus(id, statusRequest) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.idSvc
                .checkValidId(id)
                .then(() => this.statusSvc.postStatus(id, statusRequest));
        });
    }
    getStatuses(id, from, to) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.idSvc
                .checkValidId(id)
                .then(() => this.statusSvc.getStatuses(id, from, to));
        });
    }
};
tslib_1.__decorate([
    (0, common_1.Get)('status'),
    tslib_1.__param(0, (0, common_1.Headers)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_a = typeof Promise !== "undefined" && Promise) === "function" ? _a : Object)
], StatusController.prototype, "getStatus", null);
tslib_1.__decorate([
    (0, common_1.Post)('status'),
    tslib_1.__param(0, (0, common_1.Headers)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_b = typeof _models_1.StatusRequest !== "undefined" && _models_1.StatusRequest) === "function" ? _b : Object]),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], StatusController.prototype, "postStatus", null);
tslib_1.__decorate([
    (0, common_1.Get)('statuses'),
    tslib_1.__param(0, (0, common_1.Headers)('id')),
    tslib_1.__param(1, (0, common_1.Query)('from')),
    tslib_1.__param(2, (0, common_1.Query)('to')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String]),
    tslib_1.__metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], StatusController.prototype, "getStatuses", null);
StatusController = tslib_1.__decorate([
    (0, common_1.Controller)(''),
    tslib_1.__metadata("design:paramtypes", [typeof (_e = typeof id_service_1.IdService !== "undefined" && id_service_1.IdService) === "function" ? _e : Object, typeof (_f = typeof status_service_1.StatusService !== "undefined" && status_service_1.StatusService) === "function" ? _f : Object])
], StatusController);
exports.StatusController = StatusController;


/***/ }),

/***/ "./apps/api/src/app/status/status.module.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StatusModule = void 0;
const tslib_1 = __webpack_require__("tslib");
const common_1 = __webpack_require__("@nestjs/common");
const id_module_1 = __webpack_require__("./apps/api/src/app/id/id.module.ts");
const schedule_module_1 = __webpack_require__("./apps/api/src/app/schedule/schedule.module.ts");
const status_controller_1 = __webpack_require__("./apps/api/src/app/status/status.controller.ts");
const status_service_1 = __webpack_require__("./apps/api/src/app/status/status.service.ts");
let StatusModule = class StatusModule {
};
StatusModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [id_module_1.IdModule, schedule_module_1.ScheduleModule],
        controllers: [status_controller_1.StatusController],
        providers: [status_service_1.StatusService],
        exports: [status_service_1.StatusService],
    })
], StatusModule);
exports.StatusModule = StatusModule;


/***/ }),

/***/ "./apps/api/src/app/status/status.service.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var StatusService_1, _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StatusService = void 0;
const tslib_1 = __webpack_require__("tslib");
const common_1 = __webpack_require__("@nestjs/common");
const db = __webpack_require__("cyclic-dynamodb");
const date_fns_1 = __webpack_require__("date-fns");
const schedule_service_1 = __webpack_require__("./apps/api/src/app/schedule/schedule.service.ts");
// in order to be able to query exactly the days which are present (to not get keys which are not available)
// key: <ID>_YYYY, value: ["20221001","20221002"]
// collection would contain (per ID) 1 entry per year = 365 * 11 + 2 = 4017 bytes
// const COLL_STATUS_DAYS = 'statusDays';
// key: <ID>_<UUID>, value: {"from":"2022-10-03T10:00:00Z","priority":1,"set":19,"rUnit":"w","rDays":[0,1,2,3,4],"rFrom":"0700","rTo":"1700"} -> for recurring setting
// key: <ID>_<UUID>, value: {"from":"2022-10-03T10:00:00Z","to":"2022-10-03T16:00:00Z","priority":10,"set":21} -> for one-time setting
const COLL_SCHEDULE = 'schedule';
// key: <ID>_YYYYMMDD, value: [{"1005":21.5,"1010":21.75}]
// each day a JSON string of 24*12=288 entries (with 5 min refresh), ca. 12*288=3500 bytes
// collection would yearly contain (per ID) 365 entries = 365 * (50 + 3500) = ca. 1.3 MB
const COLL_STATUS = 'status';
const MAX_LOOK_BEHIND = 30;
let StatusService = StatusService_1 = class StatusService {
    constructor(scheduleSvc) {
        this.scheduleSvc = scheduleSvc;
        this.logger = new common_1.Logger(StatusService_1.name);
    }
    getStatus(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.logger.debug(`getStatus id=${id}`);
            const statusColl = db.collection(COLL_STATUS);
            let statusItem = undefined;
            let iterations = 0;
            let latestDate = new Date();
            do {
                const key = `${id}_${(0, date_fns_1.format)(latestDate, 'yyyyMMdd')}`;
                statusItem = yield statusColl.get(key);
                latestDate = (0, date_fns_1.sub)(latestDate, { days: 1 });
            } while (!statusItem && iterations++ < MAX_LOOK_BEHIND);
            if (statusItem) {
                const latestStatus = this.getStatusesFromItem(statusItem).pop();
                if (latestStatus) {
                    return latestStatus;
                }
                else {
                    throw new common_1.HttpException('Could not retrieve status because no status found', common_1.HttpStatus.NOT_FOUND);
                }
            }
            else {
                throw new common_1.HttpException('Could not retrieve status because no status found', common_1.HttpStatus.NOT_FOUND);
            }
        });
    }
    getStatuses(id, from, to) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.logger.debug(`getStatuses id=${id}, from=${from}, to=${to}`);
            const briefStatusItems = yield db.collection(COLL_STATUS).list();
            const statusItems = yield Promise.all(briefStatusItems.results
                .filter((item) => item.key.startsWith(`${id}_`))
                .map((item) => db.collection(COLL_STATUS).get(item.key)));
            return statusItems.map((item) => this.getStatusesFromItem(item)).flat();
        });
    }
    postStatus(id, statusRequest) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.logger.debug(`postStatus id=${id}, statusRequest=${JSON.stringify(statusRequest)}`);
            const now = new Date();
            const key = `${id}_${(0, date_fns_1.format)(now, 'yyyyMMdd')}`;
            const statusColl = db.collection(COLL_STATUS);
            const props = {};
            props[(0, date_fns_1.format)(now, 'HHmm')] = statusRequest.temp;
            yield statusColl.set(key, props);
            const schedule = yield this.scheduleSvc.getEffectiveSchedule(id);
            return {
                temp: statusRequest.temp,
                ts: (0, date_fns_1.formatISO)(now),
                schedule,
            };
        });
    }
    /**
     *
     * @param {CyclicItem} item
     * @returns {Status[]}
     */
    getStatusesFromItem(item) {
        return Object.entries(item.props)
            .filter(([key]) => /\d{4}/.test(key))
            .map(([key, value]) => ({
            temp: value,
            ts: (0, date_fns_1.formatISO)((0, date_fns_1.set)(new Date(), Object.assign(Object.assign({}, this.getStatusKeyDateSetProps(item.key)), this.getStatusValueKeyTimeSetProps(key)))),
        }));
    }
    /**
     * Returns status key latter part as properties settable with date-fns.
     * @param {string} key <ID>_yyyyMMdd
     * @returns {object}
     */
    getStatusKeyDateSetProps(key) {
        const parts = key.split('_');
        if (parts.length < 2) {
            console.warn(`Invalid status key ${key}!`);
            return {};
        }
        return {
            year: +parts[parts.length - 1].substring(0, 4),
            month: (+parts[parts.length - 1].substring(4, 6)) - 1,
            date: +parts[parts.length - 1].substring(6, 8),
        };
    }
    /**
     * Returns status value key as properties settable with date-fns.
     * @param {string} key HHmm
     * @returns {object}
     */
    getStatusValueKeyTimeSetProps(key) {
        return {
            hours: +key.substring(0, 2),
            minutes: +key.substring(2, 4),
            seconds: 0,
            milliseconds: 0,
        };
    }
};
StatusService = StatusService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof schedule_service_1.ScheduleService !== "undefined" && schedule_service_1.ScheduleService) === "function" ? _a : Object])
], StatusService);
exports.StatusService = StatusService;


/***/ }),

/***/ "./libs/models/src/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/models/src/lib/recurring.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/models/src/lib/schedule.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/models/src/lib/schedule-request.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/models/src/lib/status.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/models/src/lib/status-request.ts"), exports);


/***/ }),

/***/ "./libs/models/src/lib/recurring.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./libs/models/src/lib/schedule-request.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./libs/models/src/lib/schedule.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./libs/models/src/lib/status-request.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./libs/models/src/lib/status.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "@nestjs/common":
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),

/***/ "@nestjs/config":
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),

/***/ "@nestjs/core":
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),

/***/ "@nestjs/serve-static":
/***/ ((module) => {

module.exports = require("@nestjs/serve-static");

/***/ }),

/***/ "body-parser":
/***/ ((module) => {

module.exports = require("body-parser");

/***/ }),

/***/ "cyclic-dynamodb":
/***/ ((module) => {

module.exports = require("cyclic-dynamodb");

/***/ }),

/***/ "date-fns":
/***/ ((module) => {

module.exports = require("date-fns");

/***/ }),

/***/ "express-rate-limit":
/***/ ((module) => {

module.exports = require("express-rate-limit");

/***/ }),

/***/ "helmet":
/***/ ((module) => {

module.exports = require("helmet");

/***/ }),

/***/ "tslib":
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),

/***/ "uuid":
/***/ ((module) => {

module.exports = require("uuid");

/***/ }),

/***/ "path":
/***/ ((module) => {

module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
const common_1 = __webpack_require__("@nestjs/common");
const core_1 = __webpack_require__("@nestjs/core");
const app_module_1 = __webpack_require__("./apps/api/src/app/app.module.ts");
const bodyParser = __webpack_require__("body-parser");
const helmet_1 = __webpack_require__("helmet");
const express_rate_limit_1 = __webpack_require__("express-rate-limit");
function bootstrap() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const app = yield core_1.NestFactory.create(app_module_1.AppModule, {
            logger: ['error', 'warn'],
        });
        const globalPrefix = 'api';
        app.setGlobalPrefix(globalPrefix);
        app.enableCors();
        app.use(bodyParser.json({ limit: "50mb" }));
        app.use((0, helmet_1.default)({
            contentSecurityPolicy: {
                directives: Object.assign(Object.assign({}, helmet_1.default.contentSecurityPolicy.getDefaultDirectives()), { 'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"] })
            }
        }));
        app.use((0, express_rate_limit_1.default)({
            windowMs: 15 * 60 * 1000,
            max: 500, // limit each IP to 100 requests per windowMs
        }));
        const port = process.env.PORT || 3000;
        yield app.listen(port, () => {
            common_1.Logger.log(`Listening at http://localhost:${port}/${globalPrefix}`);
        });
    });
}
bootstrap();

})();

var __webpack_export_target__ = exports;
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;
//# sourceMappingURL=main.js.map