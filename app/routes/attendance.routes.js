

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
    router.get("/attendance_summary", Attendance.attandance_summary);
    router.get("/leave_type", Attendance.LeaveType);
    router.post("/HolidayList", Attendance.HolidayList);
    router.get("/leave_history", Attendance.leave_history);
    router.post("/leaveReportSummary", Attendance.leaveReportSummary);
   
    app.use('/', router);
  };
  