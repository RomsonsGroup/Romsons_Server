// const authModel = require("../../models/auth.model.js");
const reportsModel = require("../../models/reports/reports.model.js");

exports.SelectedBeat = (req, res) => {
    reportsModel.SelectedBeat(req,(data) => {
    console.log('listAuth -------', data);
    res.send(data);
  });


};

exports.SelectOutlet_OrderHistory = (req, res) => {
    reportsModel.SelectOutlet_OrderHistory(req,(data) => {
    console.log('listAuth -------', data);
    res.send(data);
  });


};

// exports.listLeaves = (req, res) => {
//   reportsModel.listLeaves(req,(data) => {
//   console.log('listAuth -------', data);
//   res.send(data);
// });


// };


exports.LastTwovisit_OrderHistory = (req, res) => {
  reportsModel.LastTwovisit_OrderHistory(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});

};


exports.Leaveapproval = (req, res) => {
  reportsModel.Leaveapproval(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});

};

exports.Leaveapprovallist = (req, res) => {
  reportsModel.Leaveapprovallist(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});

};

exports.Leaveidapproval = (req, res) => {
  reportsModel.Leaveidapproval(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});

};


exports.LeaveidRejection = (req, res) => {
  reportsModel.LeaveidRejection(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});

};

exports.Leaverejectedlist = (req, res) => {
  reportsModel.Leaverejectedlist(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});

};

exports.Leavestatuslist = (req, res) => {
  reportsModel.Leavestatuslist(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});

};

exports.Eodfetch = (req, res) => {
  reportsModel.Eodfetch(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});


};

exports.getAttendanceHistory = (req, res) => {
  reportsModel.getAttendanceHistory(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});


};


exports.getOrdersAndActivitiesByDate = (req, res) => {
  reportsModel.getOrdersAndActivitiesByDate(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});


};


exports.ManagerTeam = (req, res) => {
  reportsModel.ManagerTeam(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});


};

exports.attendance_regulization = (req, res) => {
  reportsModel.attendance_regulization(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});


};


exports.getPendingRegularizations = (req, res) => {
  reportsModel.getPendingRegularizations(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});


};

exports.Regulizationidapproval = (req, res) => {
  reportsModel.Regulizationidapproval(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});


};


exports.Regulizationidrejected = (req, res) => {
  reportsModel.Regulizationidrejected(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});


};


exports.RejectedRegularizationList = (req, res) => {
  reportsModel.RejectedRegularizationList(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});


};

exports.ApprovedRegularizationList = (req, res) => {
  reportsModel.ApprovedRegularizationList(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});
};


exports.getPendingRegularizationCount = (req, res) => {
  reportsModel.getPendingRegularizationCount(req,(data) => {
  res.send(data);
});
};


exports.getPendingLeaveCount = (req, res) => {
  reportsModel.getPendingLeaveCount(req,(data) => {
  res.send(data);
});
};


exports.OrderHistory_MIS = (req, res) => {
    reportsModel.OrderHistory_MIS(req,(data) => {
    console.log('listAuth -------', data);
    res.send(data);
  });


};


exports.Selectdate = (req, res) => {
    reportsModel.Selectdate(req,(data) => {
    console.log('listAuth -------', data);
    res.send(data);
  });


};


exports.ActivityHistory_MIS = (req, res) => {
    reportsModel.ActivityHistory_MIS(req,(data) => {
    console.log('listAuth -------', data);
    res.send(data);
  });


};

exports.SelectActivitydate = (req, res) => {
    reportsModel.SelectActivitydate(req,(data) => {
    console.log('listAuth -------', data);
    res.send(data);
  });


};

exports.AttendanceHistory = (req, res) => {
    reportsModel.AttendanceHistory(req,(data) => {
    console.log('listAuth -------', data);
    res.send(data);
  });


};


exports.monthlyAttendance = (req, res) => {
  reportsModel.monthlyAttendance(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});


};

exports.EodDate = (req, res) => {
  reportsModel.EodDate(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});


};

exports.EodOrder = (req, res) => {
  reportsModel.EodOrder(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});


};

exports.EodOrderbutton = (req, res) => {
  reportsModel.EodOrderbutton(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});


};


exports.EodDateReturn = (req, res) => {
  reportsModel.EodDateReturn(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});


};

exports.EodReturn = (req, res) => {
  reportsModel.EodReturn(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});


};

exports.ActivityData = (req, res) => {
  reportsModel.ActivityData(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});


};

exports.EODActivityDate = (req, res) => {
  reportsModel.EODActivityDate(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});


};

exports.EODAttendance = (req, res) => {
  reportsModel.EODAttendance(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});


};


exports.Teamlink = (req, res) => {
  reportsModel.Teamlink(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});


};

exports.EodNotPunchIn = (req, res) => {
  reportsModel.EodNotPunchIn(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});


};

exports.EodShareUpdate = (req, res) => {
  reportsModel.EodShareUpdate(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});


};



exports.EodDatebutton = (req, res) => {
  reportsModel.EodDatebutton(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});


};


exports.EodDateReturnbutton = (req, res) => {
  reportsModel.EodDateReturnbutton(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});


};

exports.EodReturnbutton = (req, res) => {
  reportsModel.EodReturnbutton(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});


};

exports.EODActivityDatebutton = (req, res) => {
  reportsModel.EODActivityDatebutton(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});


};

// exports.getOrdersAndActivitiesByDateAddress = (req, res) => {
//   reportsModel.getOrdersAndActivitiesByDateAddress(req,(data) => {
//   res.send(data);
// });


// };

exports.ActivityDatabutton = (req, res) => {
  reportsModel.ActivityDatabutton(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});


};

exports.EODAttendancebutton = (req, res) => {
  reportsModel.EODAttendancebutton(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});


};


exports.skuorderwise = (req, res) => {
  reportsModel.skuorderwise(req,(data) => {
  // console.log('listAuth -------', data);
  res.send(data);
});


};

exports.Totalskuorderwise = (req, res) => {
  reportsModel.Totalskuorderwise(req,(data) => {
  // console.log('listAuth -------', data);
  res.send(data);
});


};
//////////////////////New api- 2nd -phase//////////////////////
exports.TaskShowDaysummary = (req, res) => {
  reportsModel.TaskShowDaysummary(req,(data) => {
  // console.log('listAuth -------', data);
  res.send(data);
});
};


/////////////////MTP-TOUR-PLAN-API///////////////////////////////////
exports.MtpTourPlanBeat = (req, res) => {
  reportsModel.MtpTourPlanBeat(req,(data) => {
  // console.log('listAuth -------', data);
  res.send(data);
});
};

exports.InsertMtpTourPlan = (req, res) => {
  reportsModel.InsertMtpTourPlan(req,(data) => {
  // console.log('listAuth -------', data);
  res.send(data);
});
};



exports.GetMtpTourPlan = (req, res) => {
  reportsModel.GetMtpTourPlan(req,(data) => {
  // console.log('listAuth -------', data);
  res.send(data);
});
};

exports.GetMtpDateStatus = (req, res) => {
  reportsModel.GetMtpDateStatus(req,(data) => {
  // console.log('listAuth -------', data);
  res.send(data);
});
};

exports.GetEmployeeLeaves = (req, res) => {
  reportsModel.GetEmployeeLeaves(req,(data) => {
  // console.log('listAuth -------', data);
  res.send(data);
});
};

exports.GetHolidays = (req, res) => {
  reportsModel.GetHolidays(req,(data) => {
  res.send(data);
});
};

exports.MtpPendingList = (req, res) => {
  reportsModel.MtpPendingList(req,(data) => {
  res.send(data);
});
};

exports.MtpApprovedIdBy = (req, res) => {
  reportsModel.MtpApprovedIdBy(req,(data) => {
  res.send(data);
});
};

exports.MtpApprovedList = (req, res) => {
  reportsModel.MtpApprovedList(req,(data) => {
  res.send(data);
});
};

exports.MtpRejectedIdBy = (req, res) => {
  reportsModel.MtpRejectedIdBy(req,(data) => {
  res.send(data);
});
};

exports.MtpRejectedList = (req, res) => {
  reportsModel.MtpRejectedList(req,(data) => {
  res.send(data);
});
};

exports.MtpBeatidOutlet = (req, res) => {
  reportsModel.MtpBeatidOutlet(req,(data) => {
  res.send(data);
});
};