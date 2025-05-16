// const authModel = require("../../models/auth.model.js");
const skuorderModel = require("../../models/skuorder/skuorder.model.js");

exports.skulist = (req, res) => {
    skuorderModel.skulist(req,(data) => {
    console.log('listAuth -------', data);
    res.send(data);
  });


};

exports.ADSskulist = (req, res) => {
    skuorderModel.ADSskulist(req,(data) => {
    console.log('listAuth -------', data);
    res.send(data);
  });


};

exports.EMSskulist = (req, res) => {
    skuorderModel.EMSskulist(req,(data) => {
    console.log('listAuth -------', data);
    res.send(data);
  });


};


exports.orderfilleds = (req, res) => {
    skuorderModel.orderfilleds(req,(data) => {
    console.log('listAuth -------', data);
    res.send(data);
  });


};


exports.orderreturn = (req, res) => {
  skuorderModel.orderreturn(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});


};

exports.Schememaster = (req, res) => {
  skuorderModel.Schememaster(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});


};


exports.skulisthospital = (req, res) => {
  skuorderModel.skulisthospital(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});


};


exports.GetFollowUpActivities = (req, res) => {
  skuorderModel.GetFollowUpActivities(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});


};


exports.AddNewTask = (req, res) => {
  skuorderModel.AddNewTask(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});


};


exports.UpdateMultipleFollowUpTasks = (req, res) => {
  skuorderModel.UpdateMultipleFollowUpTasks(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});


};

exports.GetPendingTaskCount = (req, res) => {
  skuorderModel.GetPendingTaskCount(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});


};

exports.ActivityHospital = (req, res) => {
  skuorderModel.ActivityHospital(req,(data) => {
  console.log('listAuth -------', data);
  res.send(data);
});


};



