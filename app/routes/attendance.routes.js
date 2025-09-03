

module.exports = app => {
    const Attendance = require("../controllers/Attendance/attendance.controller");
  
    var router = require("express").Router();
  
   
    // Retrieve all published osbss
    router.post("/ValidationAttendance", Attendance.ValidationAttendance);
    router.post("/attendance_punch_in", Attendance.attendance_punch_in);
    router.post("/attendance_punchout", Attendance.attendance_punchout);
    router.post("/LeaveApp", Attendance.LeaveApp);
    router.post("/LeaveCount", Attendance.LeaveCount);
    router.post("/punchInOutTime", Attendance.punchInOutTime);
    router.post("/shiftDetails", Attendance.shiftDetails);
    router.get("/attendance_count", Attendance.attandance_count);
    router.get("/attendance_monthly", Attendance.attendance_monthly);
    router.get("/DayWiseAttendanceReport", Attendance.DayWiseAttendanceReport);
    router.get("/attendance_summary", Attendance.attandance_summary);
    router.get("/leave_type", Attendance.LeaveType);
    router.post("/HolidayList", Attendance.HolidayList);
    router.get("/leave_history", Attendance.leave_history);
    router.get("/outletReport", Attendance.outletReport);
    router.get("/UserList", Attendance.UserList);
    router.get("/Zonelist", Attendance.Zonelist);
    router.get("/Divisionlist", Attendance.Divisionlist);
    router.get("/PerformanceSummary", Attendance.PerformanceSummary);
    router.post("/leaveReportSummary", Attendance.leaveReportSummary);
    router.get("/CrmActivityReport", Attendance.CrmActivityReport);
    router.get("/RegularizationReport", Attendance.RegularizationReport);
    router.get("/UserMasterReport", Attendance.UserMasterReport);
    router.post("/ManuallyInsertAttendance", Attendance.ManuallyInsertAttendance);

   
    app.use('/', router);
  };
  