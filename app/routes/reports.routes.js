module.exports = app => {
    const Reports = require("../controllers/Reports/reports.controller");
  
    var router = require("express").Router();
  
   
    // Retrieve all published osbss
    router.post("/SelectedBeat", Reports.SelectedBeat);
    router.post("/SelectOutlet_OrderHistory", Reports.SelectOutlet_OrderHistory);
    router.post("/LastTwovisit_OrderHistory", Reports.LastTwovisit_OrderHistory);
    router.post("/Eodfetch", Reports.Eodfetch);
    router.post("/OrderHistory_MIS", Reports.OrderHistory_MIS);
    router.post("/Selectdate", Reports.Selectdate);
    router.post("/ActivityHistory_MIS", Reports.ActivityHistory_MIS);
    router.post("/SelectActivitydate", Reports.SelectActivitydate);
    router.post("/AttendanceHistory", Reports.AttendanceHistory);
    router.post("/monthlyAttendance", Reports.monthlyAttendance);
    router.post("/EodDate", Reports.EodDate);
    router.post("/EodOrder", Reports.EodOrder);
    router.post("/EodDateReturn", Reports.EodDateReturn);
    router.post("/EodReturn", Reports.EodReturn);
    router.post("/ActivityData", Reports.ActivityData);
    router.post("/EODActivityDate", Reports.EODActivityDate);
    router.post("/EODAttendance", Reports.EODAttendance);
    router.post("/Teamlink", Reports.Teamlink);
    router.post("/Leaveidapproval", Reports.Leaveidapproval);
    router.post("/LeaveidRejection", Reports.LeaveidRejection);
    // router.post("/listLeaves", Reports.listLeaves);
    router.post("/EodNotPunchIn", Reports.EodNotPunchIn);
    router.post("/Leaveapproval", Reports.Leaveapproval);
    router.post("/Leaveapprovallist", Reports.Leaveapprovallist);
    router.post("/Leaverejectedlist", Reports.Leaverejectedlist);
    router.post("/Leavestatuslist", Reports.Leavestatuslist);
    router.post("/getAttendanceHistory", Reports.getAttendanceHistory);
    router.post("/getOrdersAndActivitiesByDate", Reports.getOrdersAndActivitiesByDate);
    router.post("/EodShareUpdate", Reports.EodShareUpdate);
    router.post("/ManagerTeam", Reports.ManagerTeam);
    router.post("/attendance_regulization", Reports.attendance_regulization);
    router.post("/getPendingRegularizations", Reports.getPendingRegularizations);
    router.post("/Regulizationidapproval", Reports.Regulizationidapproval);
    router.post("/Regulizationidrejected", Reports.Regulizationidrejected);
    router.post("/RejectedRegularizationList", Reports.RejectedRegularizationList);
    router.post("/ApprovedRegularizationList", Reports.ApprovedRegularizationList);
    router.post("/getPendingRegularizationCount", Reports.getPendingRegularizationCount);
    router.post("/getPendingLeaveCount", Reports.getPendingLeaveCount);
    router.post("/EodDatebutton", Reports.EodDatebutton);
    router.post("/EodOrderbutton", Reports.EodOrderbutton);
    router.post("/EodDateReturnbutton", Reports.EodDateReturnbutton);
    router.post("/EodReturnbutton", Reports.EodReturnbutton);
    router.post("/EODActivityDatebutton", Reports.EODActivityDatebutton);
    router.post("/ActivityDatabutton", Reports.ActivityDatabutton);
    router.post("/EODAttendancebutton", Reports.EODAttendancebutton);
    // router.get("/getOrdersAndActivitiesByDateAddress", Reports.getOrdersAndActivitiesByDateAddress);
    router.post("/skuorderwise", Reports.skuorderwise);
    router.post("/Totalskuorderwise", Reports.Totalskuorderwise);
    router.post("/TaskShowDaysummary", Reports.TaskShowDaysummary);
    router.get("/MtpTourPlanBeat", Reports.MtpTourPlanBeat);
    router.post("/InsertMtpTourPlan", Reports.InsertMtpTourPlan);
    router.get("/GetMtpTourPlan", Reports.GetMtpTourPlan);
    router.post("/GetMtpDateStatus", Reports.GetMtpDateStatus);
    router.get("/GetEmployeeLeaves", Reports.GetEmployeeLeaves);
    router.get("/GetHolidays", Reports.GetHolidays);
    app.use('/', router);
  };
  