const sql = require("../db.js");

// constructor
const skuorder = function (osbs) {
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


////////item

skuorder.skulist = (req, result) => {
  if (req.body.division == "7") {
    sql.query(`SELECT sku.sku_id,sku.sku_name,sku.sku_price,sku.sku_gst,seg.segment_code,sku.sku_gst,divs.division_name, 0 total
      FROM romsondb.cor_sku_m AS sku
      LEFT JOIN romsondb.cor_segment_m AS seg ON sku.segment_id = seg.segment_id
      LEFT JOIN romsondb.cor_division_m AS divs ON sku.division_id = divs.division_id
      ORDER BY sku.sku_name ASC`,
      (err, res) => {
        console.log("osbss: ", res);
        if (err) {
          result({ error: true, data: "Something Went Wrong" })
        }
        result({ error: false, data: res })
      });

  } else {
    sql.query(`SELECT sku.sku_id,sku.sku_name,sku.sku_price,sku.sku_gst,seg.segment_code,sku.sku_gst,divs.division_name, 0 total
      FROM romsondb.cor_sku_m AS sku
      LEFT JOIN romsondb.cor_segment_m AS seg ON sku.segment_id = seg.segment_id
      LEFT JOIN romsondb.cor_division_m AS divs ON sku.division_id = divs.division_id
      where sku.division_id = '${req.body.division}' ORDER BY sku.sku_name ASC`,
      (err, res) => {
        console.log("osbss: ", res);
        if (err) {
          result({ error: true, data: "Something Went Wrong" })
        }
        result({ error: false, data: res })
      });
  }

};

///////////filter

skuorder.ADSskulist = (req, result) => {
  sql.query(`Select sku.sku_name,sku.sku_price,seg.segment_code,sku.sku_gst, 0 total FROM romsondb.cor_sku_m AS sku
    LEFT JOIN romsondb.cor_segment_m AS seg ON sku.segment_id = seg.segment_id
    where sku.segment_id = '${req.body.segment_id}'`,
    (err, res) => {
      console.log("osbss: ", res);
      if (err) {
        result({ error: true, data: "Something Went Wrong" })
      }
      result({ error: false, data: res })
    });
};

skuorder.EMSskulist = (req, result) => {
  sql.query(`Select sku.sku_name,sku.sku_price,seg.segment_code,sku.sku_gst, 0 total FROM romsondb.cor_sku_m AS sku
    LEFT JOIN romsondb.cor_segment_m AS seg ON sku.segment_id = seg.segment_id
    where sku.segment_id = '${req.body.segment_id}'`,
    (err, res) => {
      console.log("osbss: ", res);
      if (err) {
        result({ error: true, data: "Something Went Wrong" })
      }
      result({ error: false, data: res })
    });
};



/////////order

// skuorder.orderfilleds = async (req, results) => {

//   const TaskAuto = await OrderAutoNo();

//   let detailQry = `INSERT INTO  crm_dev_db.cor_order_d (order_id, item_id, item_qty,item_price_unit,item_gst,enter_by,enter_date,order_amt,order_gst_amt,item_value,item_discount)
//     VALUES`;

//   let querry = `INSERT INTO crm_dev_db.cor_order_m (
//       order_id, 
//       order_date, 
//       order_time,
//       outlet_id,
//       phone_no,
//       joined_call_id,
//       joined_name,
//       call_type,
//       employee_id,
//       enter_by,
//       enter_date,
//       scheme_discount,
//       total_quantity,
//       discount_amount,
//       zone_id,
//       division_m,
//       order_lat,
//       order_lag,
//       dealer_id,
//       reporting_to_user_id,
//       beat_id
//       ) VALUES (${TaskAuto[0]["crm_dev_db.all_auto_no(44)"]},
//       curdate(),
//       sysdate(),
//       '${req.body.outletID}',
//       '${req.body.pnumber}',
//       '${req.body.joinedid}',
//       '${req.body.joinedName}',
//       '${req.body.callType}',
//       '${req.body.employeeID}',
//       '${req.body.enterBy}',
//       sysdate(),
//       '${req.body.schemdiscount}',
//       '${req.body.totalquantity}',
//       '${req.body.discountamount}',
//       '${req.body.zone}',
//       '${req.body.division}',
//       '${req.body.lat}',
//       '${req.body.lag}',
//       '${req.body.dealer_id}',
//       '${req.body.reporting_to_user_id}',
//       '${req.body.beat_id}'
//       );`



//   sql.query(querry, (err, result) => {
//     req.body.detail.map((res, index) => {
//       detailQry += `(${TaskAuto[0]["crm_dev_db.all_auto_no(44)"]},
//           '${res.sku_id}','${res.itemvalue}','${res.sku_price}',
//           '${res.sku_gst}','${req.body.enterBy}',sysdate(),${res.itemvalue}*${res.sku_price},
//           (${res.itemvalue}*${res.sku_price}*${res.sku_gst})/100,
//           (${res.itemvalue}*${res.sku_price})+((${res.itemvalue}*${res.sku_price}*${res.sku_gst})/100),
//           '${req.body.item_discount}')`;

//       if (index < req.body.detail.length - 1) {
//         detailQry += ",";
//       }
//     });

//     setTimeout(() => {
//       sql.query(detailQry, (err, resp) => {
//         console.log(result, resp);
//         results({ result, resp });
//       });
//     }, 2000);

//     //    res.send(result);
//     // console.log(querry);
//   });
// };

skuorder.orderfilleds = async (req, results) => {
  const TaskAuto = await OrderAutoNo();

  const safeVal = (val) => (val !== null && val !== undefined && val !== '' ? `'${val}'` : 'NULL');

  let detailQry = `INSERT INTO crm_dev_db.cor_order_d (order_id, item_id, item_qty, item_price_unit, item_gst, enter_by, enter_date, order_amt, order_gst_amt, item_value, item_discount) VALUES`;

  let querry = `INSERT INTO crm_dev_db.cor_order_m (
    order_id, 
    order_date, 
    order_time,
    outlet_id,
    phone_no,
    joined_call_id,
    joined_name,
    call_type,
    employee_id,
    enter_by,
    enter_date,
    scheme_discount,
    total_quantity,
    discount_amount,
    zone_id,
    division_m,
    order_lat,
    order_lag,
    dealer_id,
    reporting_to_user_id,
    beat_id
  ) VALUES (
    ${TaskAuto[0]["crm_dev_db.all_auto_no(44)"]},
    curdate(),
    sysdate(),
    ${safeVal(req.body.outletID)},
    ${safeVal(req.body.pnumber)},
    ${safeVal(req.body.joinedid)},
    ${safeVal(req.body.joinedName)},
    ${safeVal(req.body.callType)},
    ${safeVal(req.body.employeeID)},
    ${safeVal(req.body.enterBy)},
    sysdate(),
    ${safeVal(req.body.schemdiscount)},
    ${safeVal(req.body.totalquantity)},
    ${safeVal(req.body.discountamount)},
    ${safeVal(req.body.zone)},
    ${safeVal(req.body.division)},
    ${safeVal(req.body.lat)},
    ${safeVal(req.body.lag)},
    ${safeVal(req.body.dealer_id)},
    ${safeVal(req.body.reporting_to_user_id)},
    ${safeVal(req.body.beat_id)}
  );`;

  sql.query(querry, (err, result) => {
    req.body.detail.map((res, index) => {
      detailQry += `(${TaskAuto[0]["crm_dev_db.all_auto_no(44)"]},
        '${res.sku_id}','${res.itemvalue}','${res.sku_price}',
        '${res.sku_gst}','${req.body.enterBy}',sysdate(),
        ${res.itemvalue}*${res.sku_price},
        (${res.itemvalue}*${res.sku_price}*${res.sku_gst})/100,
        (${res.itemvalue}*${res.sku_price})+((${res.itemvalue}*${res.sku_price}*${res.sku_gst})/100),
        '${req.body.item_discount}')`;

      if (index < req.body.detail.length - 1) {
        detailQry += ",";
      }
    });

    setTimeout(() => {
      sql.query(detailQry, (err, resp) => {
        console.log(result, resp);
        results({ result, resp });
      });
    }, 2000);
  });
};

//////return

skuorder.orderreturn = async (req, results) => {

  const ReturnAuto = await ReturnAutoNo();
  console.log(ReturnAuto, "ReturnAuto");

  let detailQry = `INSERT INTO  crm_dev_db.cor_order_return_d (order_return_id, item_id, item_qty,item_price_unit,item_gst,order_return_reason,enter_by,enter_date,return_order_amt,return_order_gst_amt,item_value)
      VALUES`;

  let querry = `INSERT INTO crm_dev_db.cor_order_return_m (
        order_return_id, 
        order_return__date, 
        order_return_time,
        outlet_id,
        phone_no,
        employee_id,
        enter_by,
        enter_date,
        scheme_discount,
        total_quantity,
        discount_amount,
        division_m,
        zone_id,
        return_order_lat,
        return_order_lag,
        dealer_id,
        reporting_to_user_id,
        beat_id
        ) VALUES (${ReturnAuto[0]["crm_dev_db.all_auto_no(77)"]},
        curdate(),
        sysdate(),
        '${req.body.outletID}',
        '${req.body.pnumber}',
        '${req.body.employeeID}',
        '${req.body.enterBy}',
        sysdate(),
        '${req.body.schemdiscountreturn}',
        '${req.body.totalquantityreturn}',
        '${req.body.discountamountreturn}',
        '${req.body.division}',
        '${req.body.zone}',
        '${req.body.lat}',
        '${req.body.lag}',
        '${req.body.dealer_id}',
        '${req.body.reporting_to_user_id}',
        '${req.body.beat_id}'
        );`

  // console.log(detailQry,"///////////////");
  // console.log(querry, "..............");


  sql.query(querry, (err, result) => {
    req.body.detail.map((res, index) => {
      detailQry += `(${ReturnAuto[0]["crm_dev_db.all_auto_no(77)"]},
          '${res.itemId}','${res.value}','${res.price}','${res.itmgst}',
            '${res.ITM}','${req.body.enterBy}',sysdate(),
            ${res.value}*${res.price},
            (${res.value}*${res.price}*${res.itmgst})/100,
            (${res.value}*${res.price})+((${res.value}*${res.price}*${res.itmgst})/100))`;

      if (index < req.body.detail.length - 1) {
        detailQry += ",";
      }
    });
    console.log(querry, "master");
    setTimeout(() => {
      sql.query(detailQry, (err, resp) => {
        console.log(result, resp);
        results({ result, resp });
      });
    }, 2000);

    //    res.send(result);
    console.log(results);
  });
};

////////////scheme

skuorder.Schememaster = (req, result) => {
  sql.query(`SELECT scheme_id,scheme_name,for_quantity,division_id,for_amount,start_date_time,end_date_time FROM romsondb.cor_scheme_m where division_id='${req.body.divId}'
      and '${req.body.SchemeDate}' between start_date_time and end_date_time ORDER BY for_quantity DESC`,
    (err, res) => {
      console.log("osbss: ", res);
      if (err) {
        result({ error: true, data: "Something Went Wrong" })
      }
      result({ error: false, data: res })
    });
};



///////hospital

skuorder.skulisthospital = (req, result) => {
  console.log(typeof(req.body.division),"dividion");
  console.log(req.body.division,"req.body.division")
  if (req.body.division == "7") {
    
    sql.query(`SELECT sku.sku_id,sku.sku_name,sku.sku_price,sku.sku_gst,seg.segment_code,sku.sku_gst,divs.division_name, 0 total
      FROM romsondb.cor_sku_m AS sku
      LEFT JOIN romsondb.cor_segment_m AS seg ON sku.segment_id = seg.segment_id
      LEFT JOIN romsondb.cor_division_m AS divs ON sku.division_id = divs.division_id
      ORDER BY sku.sku_name ASC`,
    (err, res) => {
    
      if (err) {
        result({ error: true, data: "Something Went Wrong" })
      }
      result({ error: false, data: res })
    });
  } else {
    sql.query(`SELECT sku.sku_id,sku.sku_name,sku.sku_price,sku.sku_gst,seg.segment_code,sku.sku_gst,divs.division_name, 0 total
      FROM romsondb.cor_sku_m AS sku
      LEFT JOIN romsondb.cor_segment_m AS seg ON sku.segment_id = seg.segment_id
      LEFT JOIN romsondb.cor_division_m AS divs ON sku.division_id = divs.division_id
      where sku.division_id = '${req.body.division}' ORDER BY sku.sku_name ASC`,
    (err, res) => {
    
      if (err) {
        result({ error: true, data: "Something Went Wrong" })
      }
      result({ error: false, data: res })
    });
   
  }

  
 
};


// skuorder.ActivityHospital =  async(req, results) => {

//   console.log(req.body,"line 262");

//   const ActivityAuto = await ActivityAutoNO();
//   console.log(ActivityAuto,"ReturnAuto");

//   let detailQry = `INSERT INTO crm_dev_db.cor_outlet_activity_m (activity_id,outlet_id, item_id, enter_by,user_type,remark,follow_up,enter_date,hospital_customer_name,hospital_name,activity_date,zone_id,division_m,act_lat,act_long, joined_name, call_type,joined_call_id)
//   VALUES`;


//   sql.query( detailQry, (err, result) => {
//     req.body.activitydetails.map((res, index) => {
//       detailQry += `(${ActivityAuto[0]["crm_dev_db.all_auto_no(66)"]},"${res.Outletid}",
//       "${res.itemId}",
//       "${req.body.enterbyy}","${res.custype}","${res.value}", "${res.followup}",
//       sysdate(),"${res.customername}","${res.Hosname}",curdate(),"${req.body.zone}",
//       "${req.body.div}","${req.body.lat}","${req.body.lag}","${req.body.joinedName}","${req.body.callType}",${req.body.joinedcallid})`;
//       if (index < req.body.activitydetails.length - 1) {
//         detailQry += ",";
//       }
//     });
//     console.log(detailQry, "/./././././");

// sql.query(detailQry, (err, resp) => {
//   console.log(result, resp,"Line 285");
//   if(err){
//     results({error:true,data:"Something Went Wrong"})
//   }else{
//     results({ error: false, data: "Successfully Submited" });
//   }

// });

//     });
//   };

///////////




skuorder.ActivityHospital = async (req, results) => {
  console.log(req.body, "line 262");

  const ActivityAuto = await ActivityAutoNO();
  console.log(ActivityAuto, "ReturnAuto");

  let activityIdStart = ActivityAuto[0]["crm_dev_db.all_auto_no(66)"];

  const detailQryBase = `INSERT INTO crm_dev_db.cor_outlet_activity_m 
    (activity_id, outlet_id, item_id, enter_by, user_type, remark, follow_up, enter_date, hospital_customer_name, hospital_name, activity_date, zone_id, division_m, act_lat, act_long, joined_name, call_type, joined_call_id) 
    VALUES `;

  const taskQryBase = `INSERT INTO crm_dev_db.cor_task_m 
    (task_name, enter_date, status, joint_id, joint_name, priority, follow_up, outlet_category_name, activity_id) 
    VALUES `;

  const valuesActivity = [];
  const valuesTask = [];
  let hasFollowUp = false;

  const outletIds = req.body.activitydetails.map(d => `'${d.Outletid}'`).join(",");
  const skuIds = req.body.activitydetails.map(d => `'${d.itemId}'`).join(",");

  const categoryMapQuery = `
    SELECT o.outlet_id, c.outlet_category_name
    FROM crm_dev_db.cor_outlet_m o
    LEFT JOIN crm_dev_db.cor_outlet_category_m c
    ON o.outlet_category_id = c.outlet_category_id
    WHERE o.outlet_id IN (${outletIds});
  `;

  const skuMapQuery = `
    SELECT sku_id, sku_name
    FROM crm_dev_db.cor_sku_m
    WHERE sku_id IN (${skuIds});
  `;

  sql.query(categoryMapQuery, (catErr, catResult) => {
    if (catErr) {
      console.log(catErr, "Error Fetching Category Map");
      return results({ error: true, data: "Error fetching outlet categories" });
    }

    const categoryMap = {};
    catResult.forEach(row => {
      categoryMap[row.outlet_id] = row.outlet_category_name || "";
    });

    // 🔍 Now fetch sku_name map
    sql.query(skuMapQuery, (skuErr, skuResult) => {
      if (skuErr) {
        console.log(skuErr, "Error Fetching SKU Map");
        return results({ error: true, data: "Error fetching SKU names" });
      }

      const skuMap = {};
      skuResult.forEach(row => {
        skuMap[row.sku_id] = row.sku_name || "";
      });

      // 🧠 Prepare insert values
      req.body.activitydetails.forEach((res, index) => {
        const activity_id = activityIdStart + index;

        valuesActivity.push(`(${activity_id}, "${res.Outletid}", "${res.itemId}", "${req.body.enterbyy}", "${res.custype}", "${res.value}", "${res.followup}", NOW(), "${res.customername}", "${res.Hosname}", CURDATE(), "${req.body.zone}", "${req.body.div}", "${req.body.lat}", "${req.body.lag}", "${req.body.joinedName}", "${req.body.callType}", ${req.body.joinedcallid})`);

        if (res.followup && res.followup.trim() !== "") {
          hasFollowUp = true;
          const skuName = skuMap[res.itemId] || "";
          const outletCategoryName = categoryMap[res.Outletid] || "";
          const taskName = ` [outlet_name] ${res.Hosname},[sku_name] ${skuName}, [customer_name] ${res.customername}, [Dept] ${res.custype}, [remarks] ${res.value}`;

          valuesTask.push(`("${taskName}", NOW(), "Pending", ${req.body.joinedcallid}, "${req.body.joinedName}", "High", "${res.followup}", "${outletCategoryName}", ${activity_id})`);
        }
      });

      const detailQry = detailQryBase + valuesActivity.join(",");
      console.log(detailQry, "---- Final Activity Query");

      sql.query(detailQry, (err, result) => {
        if (err) {
          console.log(err, "Activity Insert Error");
          return results({ error: true, data: "Something Went Wrong While Inserting Activity" });
        }

        if (hasFollowUp && valuesTask.length > 0) {
          const taskQry = taskQryBase + valuesTask.join(",");
          console.log(taskQry, "==== Final Task Query");

          sql.query(taskQry, (taskErr, taskResult) => {
            if (taskErr) {
              console.log(taskErr, "Task Insert Error");
              return results({ error: true, data: "Activity Saved But Task Insert Failed" });
            }

            return results({ error: false, data: "Successfully Submitted Activity and Task" });
          });
        } else {
          return results({ error: false, data: "Successfully Submitted Activity" });
        }
      });
    });
  });
};



// skuorder.GetFollowUpActivities = async (req, results) => {
//   try {
//     const { followup_date, enter_by } = req.body; // expected format: 'YYYY-MM-DD'

//     if (!followup_date || !enter_by) {
//       return results({ error: true, data: "followup_date and enter_by are required" });
//     }

//     const query = `
//       SELECT 
//         a.activity_id,
//         a.outlet_id,
//         a.item_id,
//         s.sku_name,
//         a.user_type,
//         a.remark,
//         a.follow_up,
//         a.hospital_customer_name AS customername,
//         a.hospital_name AS hospitalname,
//         a.activity_date,
//         a.zone_id,
//         a.division_m,
//         a.act_lat,
//         a.act_long,
//         a.joined_name,
//         a.call_type,
//         a.joined_call_id,
//         o.outlet_name,
//         c.outlet_category_name,
//         t.task_id,
//         t.task_name,
//         t.status AS followup_status,
//         t.priority AS followup_priority
//       FROM crm_dev_db.cor_outlet_activity_m a
//       LEFT JOIN crm_dev_db.cor_outlet_m o 
//         ON a.outlet_id = o.outlet_id
//       LEFT JOIN crm_dev_db.cor_outlet_category_m c 
//         ON o.outlet_category_id = c.outlet_category_id
//       LEFT JOIN crm_dev_db.cor_task_m t 
//         ON a.activity_id = t.activity_id
//       LEFT JOIN crm_dev_db.cor_sku_m s 
//         ON a.item_id = s.sku_id 
//       WHERE a.follow_up LIKE ? AND a.enter_by = ?
//       ORDER BY a.activity_id DESC;
//     `;

//     const likeDate = `%${followup_date}%`;

//     sql.query(query, [likeDate, enter_by], (err, result) => {
//       if (err) {
//         console.log(err, "Error fetching follow-up activities");
//         return results({ error: true, data: "Error fetching follow-up activities" });
//       }

//       return results({ error: false, data: result });
//     });
//   } catch (error) {
//     console.log(error, "Unexpected error in GetFollowUpActivities");
//     return results({ error: true, data: "Unexpected server error" });
//   }
// };


// skuorder.GetFollowUpActivities = async (req, results) => {
//   try {
//     const { followup_date, enter_by } = req.body;

//     if (!followup_date || !enter_by) {
//       return results({ error: true, data: "followup_date and enter_by are required" });
//     }

//     const query = `
//       SELECT 
//   t.task_id,
//   t.follow_up,
//   t.status AS followup_status,
//   t.priority AS followup_priority,
//   t.joint_id,
//   t.joint_name,
//   t.task_name,
//   c.outlet_category_name,
//   a.call_type
// FROM crm_dev_db.cor_task_m t
// LEFT JOIN crm_dev_db.cor_outlet_activity_m a ON t.activity_id = a.activity_id
// LEFT JOIN crm_dev_db.cor_outlet_m o ON a.outlet_id = o.outlet_id
// LEFT JOIN crm_dev_db.cor_outlet_category_m c ON o.outlet_category_id = c.outlet_category_id
// WHERE a.follow_up LIKE ? AND a.enter_by = ?
// ORDER BY t.task_id DESC;

//     `;

//     const likeDate = `%${followup_date}%`;

//     sql.query(query, [likeDate, enter_by], (err, result) => {
//       if (err) {
//         console.log(err, "Error fetching follow-up activities");
//         return results({ error: true, data: "Error fetching follow-up activities" });
//       }

//       return results({ error: false, data: result });
//     });
//   } catch (error) {
//     console.log(error, "Unexpected error in GetFollowUpActivities");
//     return results({ error: true, data: "Unexpected server error" });
//   }
// };

skuorder.GetFollowUpActivities = async (req, results) => {
  try {
    const { followup_date, enter_by } = req.body;

    if (!followup_date || !enter_by) {
      return results({ error: true, data: "followup_date and enter_by are required" });
    }

    const likeDate = `%${followup_date}%`;

    const query = `
      SELECT 
        t.task_id,
        t.follow_up,
        t.status AS followup_status,
        t.priority AS followup_priority,
        t.joint_id,
        t.joint_name AS call_type,
        t.task_name,
        c.outlet_category_name,
        a.call_type AS activity_call_type,  -- optional, in case needed
        'from_activity' AS source,
        NULL AS remarks
      FROM crm_dev_db.cor_task_m t
      LEFT JOIN crm_dev_db.cor_outlet_activity_m a ON t.activity_id = a.activity_id
      LEFT JOIN crm_dev_db.cor_outlet_m o ON a.outlet_id = o.outlet_id
      LEFT JOIN crm_dev_db.cor_outlet_category_m c ON o.outlet_category_id = c.outlet_category_id
      WHERE a.follow_up LIKE ? AND a.enter_by = ?

      UNION

      SELECT 
        t.task_id,
        t.follow_up,
        t.status AS followup_status,
        t.priority AS followup_priority,
        t.joint_id,
        t.joint_name AS call_type,
        t.task_name,
        NULL AS outlet_category_name,
        NULL AS activity_call_type,
        'manual' AS source,
        t.remarks
      FROM crm_dev_db.cor_task_m t
      LEFT JOIN crm_dev_db.cor_outlet_activity_m a ON t.activity_id = a.activity_id
      WHERE t.follow_up LIKE ? AND t.enter_by = ? AND t.activity_id IS NULL

      ORDER BY task_id DESC;
    `;

    sql.query(query, [likeDate, enter_by, likeDate, enter_by], (err, result) => {
      if (err) {
        console.log(err, "Error fetching follow-up activities");
        return results({ error: true, data: "Error fetching follow-up activities" });
      }

      return results({ error: false, data: result });
    });
  } catch (error) {
    console.log(error, "Unexpected error in GetFollowUpActivities");
    return results({ error: true, data: "Unexpected server error" });
  }
};




skuorder.AddNewTask = async (req, result) => {
  const { taskname, status, remarks, jointid, jointname, priority, followup, enterBy,tasklat, tasklag } = req.body;

  
  if (taskname && taskname.length > 240) {
    return result({ error: true, message: "Task name cannot exceed 240 characters" });
  }

  if (remarks && remarks.length > 100) {
    return result({ error: true, message: "Remarks cannot exceed 100 characters" });
  }

  let query = `
    INSERT INTO romsondb.cor_task_m (
      enter_date, task_name, status, remarks, joint_id, joint_name, priority, follow_up, enter_by,task_lat,task_lag
    ) VALUES (
      NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `;

  const values = [taskname, status, remarks, jointid, jointname, priority, followup, enterBy, tasklat, tasklag];

  sql.query(query, values, (err, res) => {
    if (err) {
      console.error("Insert Error:", err);
      return result({ error: true, message: 'Task not added', details: err.message });
    }
    return result({ error: false, message: 'Task added successfully' });
  });
};





skuorder.UpdateMultipleFollowUpTasks = (req, result) => {
  const { taskIds, status, priority,remarks } = req.body;

  if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
    return result({ error: true, message: "taskIds are required as an array" });
  }

  if (!status && !priority && !remarks) {
    return result({ error: true, message: "No fields to update" });
  }

  let query = `UPDATE crm_dev_db.cor_task_m SET `;
  const values = [];

  // Start building SET part
  if (status) {
    query += `status = ?`;
    values.push(status);
  }

  if (priority) {
    if (status) query += `, `;
    query += `priority = ?`;
    values.push(priority);
  }

  if (remarks) {
    if (status || priority) query += `, `;
    query += `remarks = ?`;
    values.push(remarks);
  }

  // Always update modify_date
  if (status || priority || remarks) {
    query += (status || priority || remarks) ? `, ` : ``;
    query += `modify_date = NOW()`;
  }

  query += ` WHERE task_id IN (${taskIds.map(() => "?").join(", ")})`;

  sql.query(query, [...values, ...taskIds], (err, res) => {
    if (err) {
      console.error("Update Error:", err);
      return result({ error: true, message: "Something went wrong" });
    }

    return result({ error: false, message: "Tasks updated successfully", data: res });
  });
};



skuorder.GetPendingTaskCount = async (req, result) => {
  const { emp_id } = req.body;

  if (!emp_id) {
    return result({ error: true, message: "emp_id is required" });
  }

  const query = `
    SELECT COUNT(*) AS pendingCount
    FROM crm_dev_db.cor_task_m t
    LEFT JOIN crm_dev_db.cor_outlet_activity_m a ON t.activity_id = a.activity_id
    WHERE t.status = 'Pending' AND (a.enter_by = ? OR t.enter_by = ?)
  `;

  sql.query(query, [emp_id, emp_id], (err, res) => {
    if (err) {
      console.error("Pending Count Error:", err);
      return result({ error: true, message: "Something went wrong" });
    }

    return result({ error: false, pendingCount: res[0].pendingCount });
  });
};


skuorder.GetPendingTaskDates = async (req, result) => {
  const { emp_id } = req.body;
  const query = `
  SELECT 
    DATE_FORMAT(CONVERT_TZ(t.follow_up, '+00:00', '+05:30'), '%d-%m-%Y') AS pending_date
  FROM crm_dev_db.cor_task_m t
  LEFT JOIN crm_dev_db.cor_outlet_activity_m a ON t.activity_id = a.activity_id
  WHERE t.status = 'Pending' 
    AND t.follow_up IS NOT NULL
    AND (a.enter_by = ? OR t.enter_by = ?)
  GROUP BY pending_date
  ORDER BY pending_date DESC
`;
  sql.query(query, [emp_id, emp_id], (err, res) => {
    if (err) {
      console.error("Pending Dates Error:", err);
      return result({ error: true, message: "Something went wrong" });
    }

    return result({ error: false, pendingDates: res });
  });
};


function OrderAutoNo() {
  return new Promise((resolve, reject) => {
    sql.query(
      `(select crm_dev_db.all_auto_no(44))`,
      (err, result) => {
        console.log(result);
        resolve(result);
      }
    );
  });
}

function ReturnAutoNo() {
  return new Promise((resolve, reject) => {
    sql.query(
      `(select crm_dev_db.all_auto_no(77))`,
      (err, result) => {
        console.log(result);
        resolve(result);
      }
    );
  });
}

function ActivityAutoNO() {
  return new Promise((resolve, reject) => {
    sql.query(
      `(select crm_dev_db.all_auto_no(66))`,
      (err, result) => {
        console.log(result);
        resolve(result);
      }
    );
  });
}


module.exports = skuorder;