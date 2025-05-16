const sql = require("../db.js");

// constructor
const expense = function (osbs) {
  this.title = osbs.title;
  this.description = osbs.description;
  this.published = osbs.published;
};


// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {

//     cb(null, `Ex-HQ/${req.params.expid}`);
//   },
//   filename: function (req, file, cb) {

//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });
// const upload = multer({ storage: storage });



expense.ExpenseDate = (req, result) => {
  sql.query(`SELECT DISTINCT
    punch_date,
    emp_id,
    enter_date,
    DATE_FORMAT(enter_date, '%Y-%m-%d') AS formatted
FROM
    romsondb.cor_attendance_m
WHERE
    (MONTH(enter_date) = MONTH(CURRENT_DATE()) OR MONTH(enter_date) = MONTH(CURRENT_DATE()) - 1)
    AND YEAR(enter_date) = YEAR(CURRENT_DATE())
    AND emp_id = '${req.body.empId}'
ORDER BY
    enter_date desc;`, (err, res) => {

    console.log("osbss: ", res);
    if (err) {
      result({ error: true, data: "Something Went Wrong" })
    }
    result({ error: false, data: res })
  });
};


expense.ExpenseSubmitDate = (req, result) => {
  sql.query(`SELECT distinct  exp_date ,attachment_flag,DATE_FORMAT(exp_date, '%Y-%m-%d') AS formatted_date
    FROM romsondb.cor_expense_d
    where
    (MONTH(exp_date) = MONTH(CURRENT_DATE()) OR MONTH(exp_date) = MONTH(CURRENT_DATE()) - 1)
   AND YEAR(exp_date) = YEAR(CURRENT_DATE()) and  
     exp_emp_id='${req.body.empId}' order by exp_date`, (err, res) => {

    console.log("osbss: ", res);
    if (err) {
      result({ error: true, data: "Something Went Wrong" })
    }
    result({ error: false, data: res })
  });
};


expense.Expensedata = (req, result) => {
  sql.query(`SELECT 
    exp.designation_id, 
    exp.m1_hq_allow ,
    exp.m1_ex_hq_allow ,
    exp.m2_hq_allow ,
    exp.m2_ex_hq_allow ,
    exp.nm_hq_allow ,
    exp.nm_ex_hq_allow ,
    exp.exp_daily_allow ,
    exp.car_allow ,
    exp.per_km_rate ,
    exp.max_km ,
    exp.fare_transport ,
    exp.hotel_exp ,
    exp.conveyance ,
    exp.medical ,
    exp.postage_print_stationary ,
    exp.team_hospital_food ,
    exp.team_meeting ,
    exp.internet ,
    exp.mobile ,
    exp.deleted_at  ,
    exp.enter_date  ,
    exp.modify_by ,
    exp.modify_date  ,
    exp.status ,
    exp.nm_hotel_exp ,
    exp.misc ,
    exp.team_fooding_exp ,
    emp.user_name,
    emp.city_id,
    emp.designation,
    city.city_id,
    city.city_name,
    city.city_type,
    des.designation_name,
    des.level
    FROM romsondb.cor_expense_m exp 
    LEFT JOIN romsondb.cor_emp_m emp on exp.designation_id = emp.designation
    LEFT JOIN romsondb.cor_city_m city on emp.city_id = city.city_id
    LEFT JOIN romsondb.cor_designation_m des on des.designation_id = exp.designation_id
    where exp.designation_id ='${req.body.desid}' and emp.emp_id='${req.body.empId}'`, (err, res) => {

    console.log("osbss: ", res);
    if (err) {
      result({ error: true, data: "Something Went Wrong" })
    }
    result({ error: false, data: res })
  });
};

expense.HqExpense = async (req, result) => {
  const ExpenseAuto = await ExpenseAutoNO();
  sql.query(`INSERT INTO romsondb.cor_expense_d (
      exp_id,
      exp_date,
      exp_type,
      exp_emp_id,
      exp_division,
      exp_from_place,
      exp_to_place1,
      exp_to_place2,
      exp_to_place3,
      exp_to_place4,
      exp_to_place5,
      exp_traval_mode,
      exp_remarks,
      enter_by,
      enter_date,
      exp_da, 
      exp_medical_remarks,exp_postage_remarks,
      exp_teamfooding_remarks,exp_internet_remarks,exp_mobile_remarks,
      exp_teamMeeting_remarks,exp_miscexp_remarks,exp_medical,exp_postage,
      exp_fooding,
      exp_internet, exp_t_meeting,
      exp_misc,
      exp_mobile)
      VALUES (
        ${ExpenseAuto[0]["romsondb.all_auto_no(88)"]},
        '${req.body.expdate}',
  '${req.body.exptype}','${req.body.empid}','${req.body.divId}','${req.body.fromplace}',
'${req.body.toplace1}','${req.body.toplace2}','${req.body.toplace3}',
  '${req.body.toplace4}','${req.body.toplace5}','${req.body.tmode}',
 '${req.body.remrk}','${req.body.enterby}',sysdate(),'${req.body.da}',
 '${req.body.exp_medical_remarks}',
 '${req.body.exp_postage_remarks}',
 '${req.body.exp_teamfooding_remarks}','${req.body.exp_internet_remarks}',
 '${req.body.exp_mobile_remarks}','${req.body.exp_teamMeeting_remarks}','${req.body.exp_miscexp_remarks}',
 '${req.body.exp_medical}', '${req.body.exp_postage}',
 '${req.body.exp_fooding}', '${req.body.exp_internet}',
 '${req.body.exp_t_meeting}', '${req.body.exp_misc}',
 '${req.body.exp_mobile}'
      )`,
    console.log(`INSERT INTO romsondb.cor_expense_d (
        exp_id,
        exp_date,
        exp_type,
        exp_emp_id,
        exp_division,
        exp_from_place,
        exp_to_place1,
        exp_to_place2,
        exp_to_place3,
        exp_to_place4,
        exp_to_place5,
        exp_traval_mode,
        exp_remarks,
        enter_by,
        enter_date,
        exp_da, 
        exp_medical_remarks,exp_postage_remarks,
        exp_teamfooding_remarks,exp_internet_remarks,exp_mobile_remarks,
        exp_teamMeeting_remarks,exp_miscexp_remarks,exp_medical,exp_postage,
        exp_fooding,
        exp_internet, exp_t_meeting,
        exp_misc,
        exp_mobile)
        VALUES (
          ${ExpenseAuto[0]["romsondb.all_auto_no(88)"]},
          '${req.body.expdate}',
    '${req.body.exptype}','${req.body.empid}','${req.body.divId}','${req.body.fromplace}',
  '${req.body.toplace1}','${req.body.toplace2}','${req.body.toplace3}',
    '${req.body.toplace4}','${req.body.toplace5}','${req.body.tmode}',
   '${req.body.remrk}','${req.body.enterby}',sysdate(),'${req.body.da}',
   '${req.body.exp_medical_remarks}',
   '${req.body.exp_postage_remarks}',
   '${req.body.exp_teamfooding_remarks}','${req.body.exp_internet_remarks}',
   '${req.body.exp_mobile_remarks}','${req.body.exp_teamMeeting_remarks}','${req.body.exp_miscexp_remarks}',
   '${req.body.exp_medical}', '${req.body.exp_postage}',
   '${req.body.exp_fooding}', '${req.body.exp_internet}',
   '${req.body.exp_t_meeting}', '${req.body.exp_misc}',
   '${req.body.exp_mobile}'
        )`), (err, res) => {

    console.log("osbss: ", res);
    if (err) {
      result({ error: true, data: "Something Went Wrong" })
    }
    result({ error: false, data: res, expid: ExpenseAuto[0]["romsondb.all_auto_no(88)"] })
  });
};

expense.EX_HqExpense = async (req, result) => {
  const ExpenseAuto = await ExpenseAutoNO();
  sql.query(`INSERT INTO romsondb.cor_expense_d (
      exp_id,
      exp_date,
      exp_type,
      exp_emp_id,
      exp_division,
      exp_from_place,
      exp_to_place1,
      exp_to_place2,
      exp_to_place3,
      exp_to_place4,
      exp_to_place5,
      exp_traval_mode,
      exp_remarks,
      enter_by,
      enter_date,
      exp_da,
      exp_ta,
      exp_medical_remarks,exp_postage_remarks,
      exp_teamfooding_remarks,exp_internet_remarks,exp_mobile_remarks,
      exp_teamMeeting_remarks,exp_miscexp_remarks,exp_medical,exp_postage,
      exp_fooding,
      exp_internet, exp_t_meeting,
      exp_misc,
      exp_mobile,
      exp_distance)
      VALUES (
        ${ExpenseAuto[0]["romsondb.all_auto_no(88)"]},
        '${req.body.expdate}',
  '${req.body.exptype}','${req.body.empid}','${req.body.divId}','${req.body.fromplace}',
'${req.body.toplace1}','${req.body.toplace2}','${req.body.toplace3}',
  '${req.body.toplace4}','${req.body.toplace5}','${req.body.tmode}',
 '${req.body.remrk}','${req.body.enterby}',sysdate(),'${req.body.da}','${req.body.ta}',
 '${req.body.exp_medical_remarks}',
   '${req.body.exp_postage_remarks}',
   '${req.body.exp_teamfooding_remarks}','${req.body.exp_internet_remarks}',
   '${req.body.exp_mobile_remarks}','${req.body.exp_teamMeeting_remarks}','${req.body.exp_miscexp_remarks}',
   '${req.body.exp_medical}', '${req.body.exp_postage}',
   '${req.body.exp_fooding}', '${req.body.exp_internet}',
   '${req.body.exp_t_meeting}', '${req.body.exp_misc}',
   '${req.body.exp_mobile}', '${req.body.exp_distance}'
      )`, console.log(`INSERT INTO romsondb.cor_expense_d (
        exp_id,
        exp_date,
        exp_type,
        exp_emp_id,
        exp_division,
        exp_from_place,
        exp_to_place1,
        exp_to_place2,
        exp_to_place3,
        exp_to_place4,
        exp_to_place5,
        exp_traval_mode,
        exp_remarks,
        enter_by,
        enter_date,
        exp_da,
        exp_ta,
        exp_medical_remarks,exp_postage_remarks,
        exp_teamfooding_remarks,exp_internet_remarks,exp_mobile_remarks,
        exp_teamMeeting_remarks,exp_miscexp_remarks,exp_medical,exp_postage,
        exp_fooding,
        exp_internet, exp_t_meeting,
        exp_misc,
        exp_mobile,
        exp_distance)
        VALUES (
          ${ExpenseAuto[0]["romsondb.all_auto_no(88)"]},
          '${req.body.expdate}',
    '${req.body.exptype}','${req.body.empid}','${req.body.divId}','${req.body.fromplace}',
  '${req.body.toplace1}','${req.body.toplace2}','${req.body.toplace3}',
    '${req.body.toplace4}','${req.body.toplace5}','${req.body.tmode}',
   '${req.body.remrk}','${req.body.enterby}',sysdate(),'${req.body.da}','${req.body.ta}',
   '${req.body.exp_medical_remarks}',
     '${req.body.exp_postage_remarks}',
     '${req.body.exp_teamfooding_remarks}','${req.body.exp_internet_remarks}',
     '${req.body.exp_mobile_remarks}','${req.body.exp_teamMeeting_remarks}','${req.body.exp_miscexp_remarks}',
     '${req.body.exp_medical}', '${req.body.exp_postage}',
     '${req.body.exp_fooding}', '${req.body.exp_internet}',
     '${req.body.exp_t_meeting}', '${req.body.exp_misc}',
     '${req.body.exp_mobile}', '${req.body.exp_distance}'
        )`), (err, res) => {

    console.log("osbss: ", res);
    if (err) {
      result({ error: true, data: "Something Went Wrong" })
    }
    result({ error: false, data: res, expid: ExpenseAuto[0]["romsondb.all_auto_no(88)"] })
  });
};

expense.Outstation_Expense = async (req, result) => {
  const ExpenseAuto = await ExpenseAutoNO();
  sql.query(`INSERT INTO romsondb.cor_expense_d (
      exp_id,
      exp_date,
      exp_type,
      exp_emp_id,
      exp_division,
      exp_from_place,
      exp_to_place1,
      exp_to_place2,
      exp_to_place3,
      exp_to_place4,
      exp_to_place5,
      exp_traval_mode,
      exp_remarks,
      enter_by,
      enter_date,
      exp_da,
      exp_ta,
      exp_hotel_exp,
      exp_conveyance_fare,
      exp_trasport_fare,
      exp_outstation_km,
      exp_medical_remarks,exp_postage_remarks,
      exp_teamfooding_remarks,exp_internet_remarks,exp_mobile_remarks,
      exp_teamMeeting_remarks,exp_miscexp_remarks,exp_medical,exp_postage,
      exp_fooding,
      exp_internet, exp_t_meeting,
      exp_misc,
      exp_mobile)
      VALUES (
        ${ExpenseAuto[0]["romsondb.all_auto_no(88)"]},
        '${req.body.expdate}',
  '${req.body.exptype}','${req.body.empid}','${req.body.divId}','${req.body.fromplace}',
'${req.body.toplace1}','${req.body.toplace2}','${req.body.toplace3}',
  '${req.body.toplace4}','${req.body.toplace5}','${req.body.tmode}',
 '${req.body.remrk}','${req.body.enterby}',sysdate(),'${req.body.da}','${req.body.ta}','${req.body.hotelexp}',
 '${req.body.conveyance_fare}','${req.body.trasport_fare}','${req.body.outstation_km}',
 '${req.body.exp_medical_remarks}',
   '${req.body.exp_postage_remarks}',
   '${req.body.exp_teamfooding_remarks}','${req.body.exp_internet_remarks}',
   '${req.body.exp_mobile_remarks}','${req.body.exp_teamMeeting_remarks}','${req.body.exp_miscexp_remarks}',
   '${req.body.exp_medical}', '${req.body.exp_postage}',
   '${req.body.exp_fooding}', '${req.body.exp_internet}',
   '${req.body.exp_t_meeting}', '${req.body.exp_misc}',
   '${req.body.exp_mobile}'
      )`, (err, res) => {

    console.log("osbss: ", res);
    if (err) {
      result({ error: true, data: "Something Went Wrong" })
    }
    result({ error: false, data: res, expid: ExpenseAuto[0]["romsondb.all_auto_no(88)"] })
  });
};

//   expense.Outstation_Expense =  async(req, result) => {
//     const ExpenseAuto = await ExpenseAutoNO();
//     sql.query(`INSERT INTO romsondb.cor_expense_d (
//       exp_id,
//       exp_date,
//       exp_type,
//       exp_emp_id,
//       exp_division,
//       exp_from_place,
//       exp_to_place1,
//       exp_to_place2,
//       exp_to_place3,
//       exp_to_place4,
//       exp_to_place5,
//       exp_traval_mode,
//       exp_remarks,
//       enter_by,
//       enter_date,
//       exp_da,
//       exp_hotel_exp,
//       exp_conveyance_fare,
//       exp_trasport_fare,
//       exp_outstation_km,
//       exp_medical_remarks,exp_postage_remarks,
//       exp_teamfooding_remarks,exp_internet_remarks,exp_mobile_remarks,
//       exp_teamMeeting_remarks,exp_miscexp_remarks,exp_medical,exp_postage,
//       exp_fooding,
//       exp_internet, exp_t_meeting,
//       exp_misc,
//       exp_mobile)
//       VALUES (
//         ${ExpenseAuto[0]["romsondb.all_auto_no(88)"]},
//         '${req.body.expdate}',
//   '${req.body.exptype}','${req.body.empid}','${req.body.divId}','${req.body.fromplace}',
// '${req.body.toplace1}','${req.body.toplace2}','${req.body.toplace3}',
//   '${req.body.toplace4}','${req.body.toplace5}','${req.body.tmode}',
//  '${req.body.remrk}','${req.body.enterby}',sysdate(),'${req.body.da}','${req.body.hotelexp}',
//  '${req.body.conveyance_fare}','${req.body.trasport_fare}','${req.body.outstation_km}',
//  '${req.body.exp_medical_remarks}',
//    '${req.body.exp_postage_remarks}',
//    '${req.body.exp_teamfooding_remarks}','${req.body.exp_internet_remarks}',
//    '${req.body.exp_mobile_remarks}','${req.body.exp_teamMeeting_remarks}','${req.body.exp_miscexp_remarks}',
//    '${req.body.exp_medical}', '${req.body.exp_postage}',
//    '${req.body.exp_fooding}', '${req.body.exp_internet}',
//    '${req.body.exp_t_meeting}', '${req.body.exp_misc}',
//    '${req.body.exp_mobile}'
//       )`,(err, res) => {

//       console.log("osbss: ", res);
//       if (err) {
//         result({ error: true, data: "Something Went Wrong" })
//       }
//       result({ error: false, data: res ,expid: ExpenseAuto[0]["romsondb.all_auto_no(88)"] })
//     });
//   };

expense.attchmentUpload = (req, result) => {

  sql.query(`update romsondb.cor_expense_d SET attachment_flag = 'Y' where exp_id = ${req.params.expid}`,
    (err, res) => {
      console.log("osbss: ", res);
      if (err) {
        result({ error: true, data: "Something Went Wrong" })
      }
      result({ error: false, data: "File Uploaded" });
    })


}

expense.OtherExpense = async (req, result) => {
  const ExpenseAuto = await ExpenseAutoNO();
  sql.query(`INSERT INTO romsondb.cor_expense_d (exp_id, exp_date, exp_type, exp_emp_id,exp_division,exp_medical,exp_postage,exp_fooding,exp_internet,exp_t_meeting,exp_misc,exp_mobile,hospital_t_fooding,exp_remarks,enter_by, enter_date)
      VALUES (
        ${ExpenseAuto[0]["romsondb.all_auto_no(88)"]},
        '${req.body.expdate}',
  '${req.body.exptype}','${req.body.empid}','${req.body.divId}','${req.body.medical}',
 '${req.body.postage}','${req.body.fooding}','${req.body.internet}','${req.body.teamMeating}','${req.body.miscExp}','${req.body.mobile}','${req.body.Hospitalfooding}','${req.body.remarks}','${req.body.enterby}',sysdate()
      )`, console.log(`INSERT INTO romsondb.cor_expense_d (exp_id, exp_date, exp_type, exp_emp_id,exp_division,exp_medical,exp_postage,exp_fooding,exp_internet,exp_t_meeting,exp_misc,exp_mobile,hospital_t_fooding,exp_remarks,enter_by, enter_date)
      VALUES (
        ${ExpenseAuto[0]["romsondb.all_auto_no(88)"]},
        '${req.body.expdate}',
  '${req.body.exptype}','${req.body.empid}','${req.body.divId}','${req.body.medical}',
 '${req.body.postage}','${req.body.fooding}','${req.body.internet}','${req.body.teamMeating}','${req.body.miscExp}','${req.body.mobile}','${req.body.Hospitalfooding}','${req.body.remarks}','${req.body.enterby}',sysdate()
      )`), (err, res) => {

    console.log("osbss: ", res);
    if (err) {
      result({ error: true, data: "Something Went Wrong" })
    }
    result({ error: false, data: res, expid: ExpenseAuto[0]["romsondb.all_auto_no(88)"] })
  });
};


// expense.medicalcount =  (req, result) => {
//   sql.query(`select IFNULL((a.ActutalExpense-a.spendExpense),0) RemainingMedical from (
//     select Count(*) as excount,
//    (select IFNULL(sum(exp_medical),0) spendMedical from romsondb.cor_expense_d where exp_emp_id = '11000011'  AND YEAR(enter_date) = YEAR(CURRENT_DATE)
//               AND MONTH(enter_date) = MONTH(CURRENT_DATE)) spendExpense,
//       (select sum(medical) actual from romsondb.cor_expense_m where designation_id='2') ActutalExpense
//       from romsondb.cor_expense_d
//       )a`,console.log(`select IFNULL((a.ActutalExpense-a.spendExpense),0) RemainingMedical from (
//         select Count(*) as excount,
//        (select IFNULL(sum(exp_medical),0) spendMedical from romsondb.cor_expense_d where exp_emp_id = '11000011'  AND YEAR(enter_date) = YEAR(CURRENT_DATE)
//                   AND MONTH(enter_date) = MONTH(CURRENT_DATE)) spendExpense,
//           (select sum(medical) actual from romsondb.cor_expense_m where designation_id='2') ActutalExpense
//           from romsondb.cor_expense_d
//           )a`), (err, res) => {

//     console.log("osbss: ", res);
//     if (err) {
//       result({ error: true, data: "Something Went Wrong" })
//     }
//     result({ error: false, data: res })
//   });
// };

expense.medicalcount = (req, result) => {
  sql.query(`select IFNULL((a.ActutalMedicalExpense-a.spendMedicalExpense),0) RemainingMedical,
    IFNULL((a.ActutalInternetExpense-a.spendInternetExpense),0) RemainingInternet,
    IFNULL((a.ActutalTeamFoodingExpense-a.spendFoodingExpense),0) RemainingTeamFooding,
    IFNULL((a.ActutalMobileExpense-a.spendMobileExpense),0) RemainingMobileExpense
     from (
          select Count(*) as excount,
         (select IFNULL(sum(exp_medical),0) spendMedical from romsondb.cor_expense_d where exp_emp_id = '${req.body.empid}'  AND YEAR(exp_date) = YEAR(CURRENT_DATE)
                    AND MONTH(exp_date) = MONTH(CURRENT_DATE)) spendMedicalExpense,
                    (select IFNULL(sum(exp_internet),0) spendInternet from romsondb.cor_expense_d where exp_emp_id = '${req.body.empid}'  AND YEAR(exp_date) = YEAR(CURRENT_DATE)
                    AND MONTH(exp_date) = MONTH(CURRENT_DATE)) spendInternetExpense,
                      (select IFNULL(sum(exp_fooding),0) spendFooding from romsondb.cor_expense_d where exp_emp_id = '${req.body.empid}'  AND YEAR(exp_date) = YEAR(CURRENT_DATE)
                    AND MONTH(exp_date) = MONTH(CURRENT_DATE))spendFoodingExpense,
                    (select IFNULL(sum(exp_mobile),0) spendMobile from romsondb.cor_expense_d where exp_emp_id = '${req.body.empid}'  AND YEAR(exp_date) = YEAR(CURRENT_DATE)
                    AND MONTH(exp_date) = MONTH(CURRENT_DATE))spendMobileExpense,
            (select sum(medical) actual from romsondb.cor_expense_m where designation_id='${req.body.divId}') ActutalMedicalExpense,
    (select sum(internet) actualInternet from romsondb.cor_expense_m where designation_id='${req.body.divId}') ActutalInternetExpense,
    (select SUM(team_hospital_food + team_meeting) AS actualTeamFooding from romsondb.cor_expense_m where designation_id='${req.body.divId}') ActutalTeamFoodingExpense,
    (select sum(mobile) actualMobile from romsondb.cor_expense_m where designation_id='${req.body.divId}') ActutalMobileExpense
            from romsondb.cor_expense_d
            )a`, console.log(`select IFNULL((a.ActutalMedicalExpense-a.spendMedicalExpense),0) RemainingMedical,
    IFNULL((a.ActutalInternetExpense-a.spendInternetExpense),0) RemainingInternet,
    IFNULL((a.ActutalTeamFoodingExpense-a.spendFoodingExpense),0) RemainingTeamFooding,
    IFNULL((a.ActutalMobileExpense-a.spendMobileExpense),0) RemainingMobileExpense
     from (
          select Count(*) as excount,
         (select IFNULL(sum(exp_medical),0) spendMedical from romsondb.cor_expense_d where exp_emp_id = '${req.body.empid}'  AND YEAR(exp_date) = YEAR(CURRENT_DATE)
                    AND MONTH(exp_date) = MONTH(CURRENT_DATE)) spendMedicalExpense,
                    (select IFNULL(sum(exp_internet),0) spendInternet from romsondb.cor_expense_d where exp_emp_id = '${req.body.empid}'  AND YEAR(exp_date) = YEAR(CURRENT_DATE)
                    AND MONTH(exp_date) = MONTH(CURRENT_DATE)) spendInternetExpense,
                      (select IFNULL(sum(exp_fooding),0) spendFooding from romsondb.cor_expense_d where exp_emp_id = '${req.body.empid}'  AND YEAR(exp_date) = YEAR(CURRENT_DATE)
                    AND MONTH(exp_date) = MONTH(CURRENT_DATE))spendFoodingExpense,
                    (select IFNULL(sum(exp_mobile),0) spendMobile from romsondb.cor_expense_d where exp_emp_id = '${req.body.empid}'  AND YEAR(exp_date) = YEAR(CURRENT_DATE)
                    AND MONTH(exp_date) = MONTH(CURRENT_DATE))spendMobileExpense,
            (select sum(medical) actual from romsondb.cor_expense_m where designation_id='${req.body.divId}') ActutalMedicalExpense,
    (select sum(internet) actualInternet from romsondb.cor_expense_m where designation_id='${req.body.divId}') ActutalInternetExpense,
    (select SUM(team_hospital_food + team_meeting) AS actualTeamFooding from romsondb.cor_expense_m where designation_id='${req.body.divId}') ActutalTeamFoodingExpense,
    (select sum(mobile) actualMobile from romsondb.cor_expense_m where designation_id='${req.body.divId}') ActutalMobileExpense
            from romsondb.cor_expense_d
            )a`), (err, res) => {

    console.log("osbss: ", res);
    if (err) {
      result({ error: true, data: "Something Went Wrong" })
    }
    result({ error: false, data: res })
  });
};

expense.ExpensesubmitDates = (req, result) => {
  sql.query(`SELECT
    DATE_FORMAT(exp_date, '%Y-%m-%d') AS formatted_date,
    exp_type,
    exp_id
FROM
    romsondb.cor_expense_d
WHERE
    exp_emp_id = '${req.body.enterby}'
    AND (
        (MONTH(exp_date) = MONTH(CURRENT_DATE()) AND YEAR(exp_date) = YEAR(CURRENT_DATE()))
        OR
        (MONTH(exp_date) = MONTH(CURRENT_DATE()) - 1 AND YEAR(exp_date) = YEAR(CURRENT_DATE()))
    )`,
    console.log(`SELECT
    DATE_FORMAT(exp_date, '%Y-%m-%d') AS formatted_date,
    exp_type,
    exp_id
FROM
    romsondb.cor_expense_d
WHERE
    exp_emp_id = '${req.body.enterby}'
    AND (
        (MONTH(exp_date) = MONTH(CURRENT_DATE()) AND YEAR(exp_date) = YEAR(CURRENT_DATE()))
        OR
        (MONTH(exp_date) = MONTH(CURRENT_DATE()) - 1 AND YEAR(exp_date) = YEAR(CURRENT_DATE()))
    )`), (err, res) => {

    console.log("osbss: ", res);
    if (err) {
      result({ error: true, data: "Something Went Wrong" })
    }
    result({ error: false, data: res })
  });
};

expense.ExpReports = (req, result) => {
  sql.query(`select * FROM romsondb.cor_expense_d where  DATE(exp_date) BETWEEN '${req.body.fromdate}' AND '${req.body.todate}' and exp_emp_id='${req.body.enterby}'`,
    console.log(`select * FROM romsondb.cor_expense_d where 
     DATE(exp_date) BETWEEN '${req.body.fromdate}'
      AND '${req.body.todate}' and exp_emp_id='${req.body.enterby}'`), (err, res) => {

    console.log("osbss: ", res);
    if (err) {
      result({ error: true, data: "Something Went Wrong" })
    }
    result({ error: false, data: res })
  });
};
expense.ReadUploadFiles = (req, result) => {
  const folderName = req.params.folderName;
  const fileName = req.params.fileName;
  const filePath = `/var/www/service/uploads/${folderName}/${fileName}`;

  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(err);
      result.status(500).send('Error reading file');
    } else {
      result.setHeader('Content-Type', 'application/octet-stream');
      result.send(data);
    }
  });
};



////////////function

function ExpenseAutoNO() {
  return new Promise((resolve, reject) => {
    sql.query(
      `(select romsondb.all_auto_no(88))`,
      (err, result) => {
        console.log(result);
        resolve(result);
      }
    );
  });
}

module.exports = expense;