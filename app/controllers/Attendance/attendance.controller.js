// const dashboardmodel = require("../../Dashboard/dashboard.controller");

const attendancemodel = require("../../models/attendance/attendance.model");

exports.ValidationAttendance = (req, res) => {
    attendancemodel.ValidationAttendance(req,(data) => {
  
      console.log('dashboardmodel -------', data);
      res.send(data);
    });
  
  
  };


  exports.attendance_punch_in = (req, res) => {
    attendancemodel.attendance_punch_in(req,(data) => {
  
      console.log('dashboardmodel -------', data);
      res.send(data);
    });
  
  
  };

  exports.attendance_punchout = (req, res) => {
    attendancemodel.attendance_punchout(req,(data) => {
  
      console.log('dashboardmodel -------', data);
      res.send(data);
    });
  
  
  };


  exports.LeaveApp = (req, res) => {
    attendancemodel.LeaveApp(req,(data) => {
  
      console.log('dashboardmodel -------', data);
      res.send(data);
    });
  
  
  };

  exports.LeaveCount = (req, res) => {
    attendancemodel.LeaveCount(req,(data) => {
  
      console.log('dashboardmodel -------', data);
      res.send(data);
    });
  
  
  };
  

  exports.attandance_count = (req, res) => {
    attendancemodel.attandance_count(req,(data) => {
  
      // console.log('dashboardmodel -------', data);
      res.send(data);
    });

  }

  exports.attendance_monthly = (req, res) => {
    attendancemodel.attendance_monthly(req,(data) => {
      res.send(data);
    });

  }

  exports.DayWiseAttendanceReport = (req, res) => {
    attendancemodel.DayWiseAttendanceReport(req,(data) => {
      res.send(data);
    });

  }

    exports.attandance_summary = (req, res) => {
      attendancemodel.attandance_summary(req,(data) => {
    
        console.log('dashboardmodel -------', data);
        res.send(data);
      });
    
  
  
  };


  exports.LeaveType = (req, res) => {
    attendancemodel.LeaveType(req,(data) => {
  
      // console.log('dashboardmodel -------', data);
      res.send(data);
    });
  
  
  };


  exports.punchInOutTime = (req, res) => {
    attendancemodel.punchInOutTime(req,(data) => {
  
      // console.log('dashboardmodel -------', data);
      res.send(data);
    });
  
  
  };

  exports.shiftDetails = (req, res) => {
    attendancemodel.shiftDetails(req,(data) => {
  
      // console.log('dashboardmodel -------', data);
      res.send(data);
    });
  
  
  };

  exports.HolidayList = (req, res) => {
    attendancemodel.HolidayList(req,(data) => {
  
      // console.log('dashboardmodel -------', data);
      res.send(data);
    });
  
  
  };



  exports.leave_history = (req, res) => {
    attendancemodel.leave_history(req,(data) => {
  
      // console.log('dashboardmodel -------', data);
      res.send(data);
    });
  
  
  };


  exports.leaveReportSummary = (req, res) => {
    attendancemodel.leaveReportSummary(req,(data) => {
      res.send(data);
    });
  
  
  };
  