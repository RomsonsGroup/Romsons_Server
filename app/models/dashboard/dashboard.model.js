const sql = require("../db.js");

// constructor
const dashboard = function(osbs) {
  this.title = osbs.title;
  this.description = osbs.description;
  this.published = osbs.published;
};


/*
*@Author:           <Anubhav Tripathi>
*@Created On:       <16-03-2023>
*@Last Modified By: <>
*@Last Modified:    <>
*@Description:      <List Item>
*/


// dashboard.ScoreCrad =  (req, result) => {
   
//     sql.query(`select a.SkuCount,a.beat_count,a.Activity_Count,a.Order_Count,a.SkuCount*a.beat_count  as Target_Count
//     from
//     (
//     select Count(*) as SkuCount,(SELECT count(*) as outletcount
// FROM romsondb.cor_outlet_m om
// LEFT JOIN romsondb.cor_mtp_a bm
// ON om.beat_id = bm.beat_id  WHERE bm.outlet_date BETWEEN ADDDATE(CURDATE(), -30) AND CURDATE() and bm.user_id = '${req.body.enterBy}' and om.status = 'A')beat_count,
//     (SELECT count(*)  as ActivityCount FROM romsondb.cor_outlet_activity_m WHERE enter_date  BETWEEN ADDDATE(CURDATE(), -30) AND CURDATE() and enter_by='${req.body.enterBy}') Activity_Count,
//     (  SELECT count(*) orderCount FROM romsondb.cor_order_m where enter_date  BETWEEN ADDDATE(CURDATE(), -30) AND CURDATE() and enter_by='${req.body.enterBy}' and status=1) Order_Count
//     FROM romsondb.cor_sku_m where division_id='${req.body.divid}' and status='A'
//     )a`, (err, res) => {
    
//       console.log("osbss: ", res);
//       if (err) {
//         result({ error: true, data: "Something Went Wrong" })
//       }
//       result({ error: false, data: res })
//     });
//   };


dashboard.ScoreCrad = (req, result) => {
  let query;
  if (req.body.divid == 1) {
    query = `select a.SkuCount,a.beat_count,a.Activity_Count,a.Order_Count,a.SkuCount*a.beat_count  as Target_Count
    from
    (
    select Count(*) as SkuCount,(SELECT count(*) as outletcount
FROM romsondb.cor_outlet_m om
LEFT JOIN romsondb.cor_mtp_a bm
ON om.beat_id = bm.beat_id     WHERE
MONTH(bm.outlet_date) = MONTH(CURRENT_DATE())  
AND YEAR(bm.outlet_date) = YEAR(CURRENT_DATE())  and bm.user_id = '${req.body.enterBy}' and om.status = 'A')beat_count,
    (SELECT count(*)  as ActivityCount FROM romsondb.cor_outlet_activity_m  WHERE
    MONTH(enter_date) = MONTH(CURRENT_DATE())  
    AND YEAR(enter_date) = YEAR(CURRENT_DATE())   and enter_by='${req.body.enterBy}') Activity_Count,
    (  SELECT count(*) orderCount FROM romsondb.cor_order_m  WHERE
    MONTH(enter_date) = MONTH(CURRENT_DATE())  
    AND YEAR(enter_date) = YEAR(CURRENT_DATE())  and enter_by='${req.body.enterBy}' ) Order_Count
    FROM romsondb.cor_sku_m where division_id='${req.body.divid}' and status='A'
    )a`;
  } else {
    query = `select a.SkuCount,a.beat_count,a.Activity_Count,a.Order_Count,a.SkuCount*a.beat_count  as Target_Count
    from
    (
    select Count(*)
 as SkuCount,(SELECT count(*)
 as outletcount
FROM romsondb.cor_outlet_m om
LEFT JOIN romsondb.cor_mtp_a bm
ON om.beat_id = bm.beat_id  WHERE bm.outlet_date = CURDATE() 
and bm.user_id = '${req.body.enterBy}' and om.status = 'A')beat_count,
    (SELECT count(*)
  as ActivityCount FROM romsondb.cor_outlet_activity_m  WHERE
  MONTH(enter_date) = MONTH(CURRENT_DATE())  
  AND YEAR(enter_date) = YEAR(CURRENT_DATE())  and enter_by='${req.body.enterBy}') Activity_Count,
    (  SELECT count(*) orderCount FROM romsondb.cor_order_m    WHERE
    MONTH(enter_date) = MONTH(CURRENT_DATE())  
    AND YEAR(enter_date) = YEAR(CURRENT_DATE())  
    AND CURDATE() and enter_by='${req.body.enterBy}') Order_Count
    FROM romsondb.cor_sku_m where division_id='${req.body.divid}' and status='A'
    )a`;
  }

  sql.query(query, (err, res) => {
    console.log("osbss: ", res);
    if (err) {
      result({ error: true, data: "Something Went Wrong" });
    }
    result({ error: false, data: res });
  });
};


  dashboard.OutletCoverage =  (req, result) => {
   
    sql.query(`select a.curtotal,(SUM(a.curactivity)+SUM(a.curorders)) as curcover,(a.curtotal-(SUM(a.curactivity)+SUM(a.curorders)))curPending,
    a.prevtotal,(SUM(a.prevactivity)+SUM(a.prevorders)) as prevcover,(a.prevtotal-(SUM(a.prevactivity)+SUM(a.prevorders)))prevPending
    from 
    (
    select Count(*) as SkuCount,
    (SELECT count(*) as outletcount
    FROM romsondb.cor_outlet_m om
    LEFT JOIN romsondb.cor_mtp_a bm
    ON om.beat_id = bm.beat_id  WHERE DATE(bm.outlet_date) 
    BETWEEN ADDDATE(CURDATE(), INTERVAL 1-DAYOFWEEK(CURDATE()) DAY)  AND ADDDATE(CURDATE(), INTERVAL 7-DAYOFWEEK(CURDATE()) 
    DAY) and bm.user_id = '${req.body.enterBy}' and om.status = 'A')curtotal,
    (SELECT distinct count(*)  as ActivityCount FROM romsondb.cor_outlet_activity_m WHERE Date(enter_date)  
    BETWEEN ADDDATE(CURDATE(), INTERVAL 1-DAYOFWEEK(CURDATE()) DAY)  AND ADDDATE(CURDATE(), INTERVAL 7-DAYOFWEEK(CURDATE()) 
    DAY) and enter_by='${req.body.enterBy}')curactivity,
    (SELECT count(*) orderCount FROM romsondb.cor_order_m WHERE Date(enter_date)  BETWEEN ADDDATE(CURDATE(), INTERVAL 1-DAYOFWEEK(CURDATE()) DAY) 
     AND ADDDATE(CURDATE(), INTERVAL 7-DAYOFWEEK(CURDATE()) 
    DAY) and enter_by='${req.body.enterBy}' and status=1) curorders,
    
    (SELECT count(*) as outletcount
    FROM romsondb.cor_outlet_m om
    LEFT JOIN romsondb.cor_mtp_a bm
    ON om.beat_id = bm.beat_id  WHERE DATE(bm.outlet_date) 
    BETWEEN ADDDATE(ADDDATE(CURDATE(), -7), INTERVAL 1-DAYOFWEEK(CURDATE()) DAY)  AND ADDDATE(ADDDATE(CURDATE(), -7), INTERVAL 7-DAYOFWEEK(CURDATE()) 
    DAY) and bm.user_id = '${req.body.enterBy}' and om.status = 'A')prevtotal,
    
    (SELECT distinct count(*)  as ActivityCount FROM romsondb.cor_outlet_activity_m WHERE Date(enter_date)  
    BETWEEN ADDDATE(ADDDATE(CURDATE(), -7), INTERVAL 1-DAYOFWEEK(CURDATE()) DAY)  AND ADDDATE(ADDDATE(CURDATE(), -7), INTERVAL 7-DAYOFWEEK(CURDATE()) 
    DAY) and enter_by='${req.body.enterBy}')prevactivity,
    
    (SELECT count(*) orderCount FROM romsondb.cor_order_m WHERE Date(enter_date)  BETWEEN ADDDATE(ADDDATE(CURDATE(), -7), INTERVAL 1-DAYOFWEEK(CURDATE()) DAY) 
     AND ADDDATE(ADDDATE(CURDATE(), -7), INTERVAL 7-DAYOFWEEK(CURDATE()) 
    DAY) and enter_by='${req.body.enterBy}' and status=1) prevorders
    
    )a`, (err, res) => {
    
      console.log("osbss: ", res);
      if (err) {
        result({ error: true, data: "Something Went Wrong" })
      }
      result({ error: false, data: res })
    });
  };


  dashboard.ApprovedOrder =  (req, result) => {
   
    sql.query(`select IFNULL(a.currOrder/100000, 0) currOrder, IFNULL(a.prevOrder/100000, 0) prevOrder from (
      select Count(*)
 as SkuCount,
      (SELECT sum(total_quantity) FROM romsondb.cor_order_m WHERE enter_by='${req.body.enterBy}' AND status=1 AND DATE(enter_date) 
      BETWEEN DATE_FORMAT(NOW(), '%Y-%m-01') AND CURDATE())currOrder,
	  (SELECT sum(total_quantity) FROM romsondb.cor_order_m WHERE enter_by='${req.body.enterBy}' AND status=1 
      AND DATE(enter_date) BETWEEN DATE_FORMAT(NOW() - INTERVAL 1 MONTH, '%Y-%m-01')  
      AND DATE_FORMAT(LAST_DAY(NOW() - INTERVAL 1 MONTH), '%Y-%m-%d')) prevOrder
      )a`, (err, res) => {
    
      console.log("osbss: ", res);
      if (err) {
        result({ error: true, data: "Something Went Wrong" })
      }
      result({ error: false, data: res })
    });
  };

  dashboard.AttendanceDashboard =  (req, result) => {
    sql.query(`SELECT att.emp_id, COUNT(if(if(att.status = 1, 'P', 'N/A')='P', CASE WHEN att.status = 1 THEN 'P' WHEN att.holiday_status = 2 THEN 'W'
    WHEN att.holiday_status = 1 THEN 'H' WHEN att.leave_status = 2 THEN 'L' ELSE 'N/A' END, null)) AS Present, 
    COUNT(if(if(att.holiday_status = 1, 'H', 'N/A')='H', CASE WHEN att.status = 1 THEN 'P' WHEN att.holiday_status = 2 
    THEN 'W' WHEN att.holiday_status = 1 THEN 'H' WHEN att.leave_status = 2 THEN 'L' ELSE 'N/A' END, null)) AS Holidays,
    COUNT(if(if(att.holiday_status = 2, 'W', 'N/A')='W', CASE WHEN att.status = 1 THEN 'P' WHEN att.holiday_status = 2 THEN 'W'
    WHEN att.holiday_status = 1 THEN 'H' WHEN att.leave_status = 2 THEN 'L' ELSE 'N/A' END, null)) AS Weekends, 
    COUNT(if(if(att.leave_status = 2, 'L', 'N/A')='L', CASE WHEN att.status = 1 THEN 'P' WHEN att.holiday_status = 2 THEN 'W' WHEN att.holiday_status = 1 
    THEN 'H' WHEN att.leave_status = 2 THEN 'L' ELSE 'N/A' END, null)) AS Leaves
   FROM cor_attendance_m as att
   WHERE att.punch_date BETWEEN DATE_FORMAT(curdate(), '%Y-%m-01') AND LAST_DAY(curdate()) AND emp_id='${req.body.enterBy}'`, (err, res) => {
    
      console.log("osbss: ", res);
      if (err) {
        result({ error: true, data: "Something Went Wrong" })
      }
      result({ error: false, data: res })
    });
  };


  dashboard.AppVersionCheck =  (req, result) => {
    sql.query(`SELECT version,version_ios FROM app_versions ORDER BY id `,
    console.log(`SELECT version FROM app_versions ORDER BY id `), (err, res) => {
    
      console.log("osbss: ", res);
      if (err) {
        result({ error: true, data: "Something Went Wrong" })
      }
      result({ error: false, data: res })
    });
  };

  ////Admin Dashboard

  dashboard.EmplyeeInfoWeb =  (req, result) => {
    sql.query(`With DivEmpData
    as
    (	
      Select IfNull(D.division_name,'Total') Division -- , .Emp_Id, E.Emp_Code, E.User_Name
        , Count(1) EmpCount
      From romsondb.cor_emp_m E
          Inner Join romsondb.cor_division_m D On D.Division_Id = E.Division
      Where E.status = 'A'
        Group By D.division_name
        With RollUp
    )
    , AttData
    As
    (
      Select	A.punch_date
        , IfNull(D.division_name,'Total') Division -- , .Emp_Id, E.Emp_Code, E.User_Name
        , Sum(Case When A.Status = 2 Then 1 Else 0 End) LeaveTrans
        , Sum(Case When A.Status = 2 Then 0 Else 1 End) PresentTrans
      From romsondb.cor_emp_m E
          Inner Join romsondb.cor_division_m D On D.Division_Id = E.Division
          Inner Join romsondb.cor_attendance_m A On A.emp_id = E.Emp_Id
      Where E.Status = 'A'
        -- And A.punch_date Between '2023-08-01' And '2023-09-30'
            And A.punch_date ='${req.body.punchDate}'
      Group By A.punch_date, D.division_name
        With Rollup
        
    )
    , MonthData
    As
    (
      Select	D.Punch_Date
        , 'Leave' AttType, D.Division
            , Sum(D.LeaveTrans) Trans
      From AttData D
      Where D.Punch_Date Is Not Null
      Group By D.Division, D.Punch_Date
      Union All
      Select	D.Punch_Date
        , 'Present' AttType, D.Division
            , Sum(D.PresentTrans) Trans
      From AttData D
      Where D.Punch_Date Is Not Null
      Group By D.Division, D.Punch_Date
        Union All
      Select	D.Punch_Date
        , 'Total' AttType, D.Division
            , Max(E.EmpCount) Trans
      From AttData D
          Inner Join DivEmpData E On E.Division = D.Division
      Where D.Punch_Date Is Not Null
      Group By D.Division, D.Punch_Date
        Union All
      Select	D.Punch_Date
        , 'Absent' AttType, D.Division
            , Max(E.EmpCount) - Sum(D.PresentTrans) - Sum(D.LeaveTrans) Trans
      From AttData D
          Inner Join DivEmpData E On E.Division = D.Division
      Where D.Punch_Date Is Not Null
      Group By D.Division, D.Punch_Date
    )
    Select D.Punch_Date 
      , D.AttType
      , Sum(Case D.Division When 'KAD' Then D.Trans End) KAD_Trans
      , Sum(Case D.Division When 'MSD' Then D.Trans End) MSD_Trans
      , Sum(Case D.Division When 'OPS' Then D.Trans End) OPS_Trans
      , Sum(Case D.Division When 'Retail' Then D.Trans End) Retail_Trans
      , Sum(Case D.Division When 'GTD' Then D.Trans End) GTD_Trans
      , Sum(Case D.Division When 'GOVT' Then D.Trans End) GOVT_Trans
      , Sum(Case D.Division When 'Total' Then D.Trans End) Total_Trans
    From MonthData D
    Group By D.Punch_Date, D.AttType
    Order By 1
    
    ;
    `,
    console.log(`With DivEmpData
    as
    (	
      Select IfNull(D.division_name,'Total') Division -- , .Emp_Id, E.Emp_Code, E.User_Name
        , Count(1) EmpCount
      From romsondb.cor_emp_m E
          Inner Join romsondb.cor_division_m D On D.Division_Id = E.Division
      Where E.status = 'A'
        Group By D.division_name
        With RollUp
    )
    , AttData
    As
    (
      Select	A.punch_date
        , IfNull(D.division_name,'Total') Division -- , .Emp_Id, E.Emp_Code, E.User_Name
        , Sum(Case When A.Status = 2 Then 1 Else 0 End) LeaveTrans
        , Sum(Case When A.Status = 2 Then 0 Else 1 End) PresentTrans
      From romsondb.cor_emp_m E
          Inner Join romsondb.cor_division_m D On D.Division_Id = E.Division
          Inner Join romsondb.cor_attendance_m A On A.emp_id = E.Emp_Id
      Where E.Status = 'A'
        -- And A.punch_date Between '2023-08-01' And '2023-09-30'
            And A.punch_date = '2023-09-12'
      Group By A.punch_date, D.division_name
        With Rollup
        
    )
    , MonthData
    As
    (
      Select	D.Punch_Date
        , 'Leave' AttType, D.Division
            , Sum(D.LeaveTrans) Trans
      From AttData D
      Where D.Punch_Date Is Not Null
      Group By D.Division, D.Punch_Date
      Union All
      Select	D.Punch_Date
        , 'Present' AttType, D.Division
            , Sum(D.PresentTrans) Trans
      From AttData D
      Where D.Punch_Date Is Not Null
      Group By D.Division, D.Punch_Date
        Union All
      Select	D.Punch_Date
        , 'Total' AttType, D.Division
            , Max(E.EmpCount) Trans
      From AttData D
          Inner Join DivEmpData E On E.Division = D.Division
      Where D.Punch_Date Is Not Null
      Group By D.Division, D.Punch_Date
        Union All
      Select	D.Punch_Date
        , 'Absent' AttType, D.Division
            , Max(E.EmpCount) - Sum(D.PresentTrans) - Sum(D.LeaveTrans) Trans
      From AttData D
          Inner Join DivEmpData E On E.Division = D.Division
      Where D.Punch_Date Is Not Null
      Group By D.Division, D.Punch_Date
    )
    Select D.Punch_Date 
      , D.AttType
      , Sum(Case D.Division When 'KAD' Then D.Trans End) KAD_Trans
      , Sum(Case D.Division When 'MSD' Then D.Trans End) MSD_Trans
      , Sum(Case D.Division When 'OPS' Then D.Trans End) OPS_Trans
      , Sum(Case D.Division When 'Retail' Then D.Trans End) Retail_Trans
      , Sum(Case D.Division When 'GTD' Then D.Trans End) GTD_Trans
      , Sum(Case D.Division When 'Total' Then D.Trans End) Total_Trans
    From MonthData D
    Group By D.Punch_Date, D.AttType
    Order By 1
    
    ;
    `), (err, res) => {
    
      console.log("osbss: ", res);
      if (err) {
        result({ error: true, data: "Something Went Wrong" })
      }
      result({ error: false, data: res })
    });
  };


  dashboard.OutletCoverageWeb =  (req, result) => {
    sql.query(`SELECT 
    TotalActive,
    covered,
    TotalActive - covered as missed
FROM
    (SELECT COUNT(*) AS TotalActive
    FROM romsondb.cor_mtp_a mtp
    LEFT JOIN romsondb.cor_outlet_m outlet ON mtp.beat_id = outlet.beat_id 
    LEFT JOIN romsondb.cor_beat_m beat ON mtp.beat_id = beat.beat_id
    WHERE EXTRACT(MONTH FROM mtp.outlet_date) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(YEAR FROM mtp.outlet_date) = EXTRACT(YEAR FROM CURRENT_DATE)
    AND outlet.status = "A"
    AND beat.division_id ='${req.body.division}') AS ActiveCounts
JOIN
    (SELECT COUNT(DISTINCT outlet_id) AS covered
    FROM romsondb.cor_outlet_activity_m
    WHERE EXTRACT(MONTH FROM activity_date) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(YEAR FROM activity_date) = EXTRACT(YEAR FROM CURRENT_DATE)
    AND division_m ='${req.body.division}') AS CoveredCounts`, (err, res) => {
    
      console.log("osbss: ", res);
      if (err) {
        result({ error: true, data: "Something Went Wrong" })
      }
      result({ error: false, data: res })
    });
  };


  dashboard.ZonewiseWeb =  (req, result) => {
    sql.query(`SELECT 
    zone.zone_name,
    SUM(orderm.total_quantity) / 100000 AS ordervalue
FROM romsondb.cor_order_m orderm
LEFT JOIN romsondb.cor_zone_m zone
ON zone.zone_id = orderm.zone_id 
WHERE EXTRACT(MONTH FROM orderm.order_date) = EXTRACT(MONTH FROM CURRENT_DATE)
AND EXTRACT(YEAR FROM orderm.order_date) = EXTRACT(YEAR FROM CURRENT_DATE)
AND orderm.division_m = '${req.body.division}'
GROUP BY zone.zone_name
UNION ALL
SELECT 
    'Total' AS zone_name,
    SUM(orderm.total_quantity) / 100000 AS ordervalue
FROM romsondb.cor_order_m orderm
LEFT JOIN romsondb.cor_zone_m zone
ON zone.zone_id = orderm.zone_id 
WHERE EXTRACT(MONTH FROM orderm.order_date) = EXTRACT(MONTH FROM CURRENT_DATE)
AND EXTRACT(YEAR FROM orderm.order_date) = EXTRACT(YEAR FROM CURRENT_DATE)
AND orderm.division_m = '${req.body.division}';
`, (err, res) => {
    
      console.log("osbss: ", res);
      if (err) {
        result({ error: true, data: "Something Went Wrong" })
      }
      result({ error: false, data: res })
    });
  };



  
module.exports = dashboard;