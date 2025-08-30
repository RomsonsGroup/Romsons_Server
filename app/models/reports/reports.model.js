
const sql = require("../db.js");

// const path = require('path');
// const getAddress = require('./getAddress');


// constructor
const reports = function (osbs) {
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


//////order

reports.SelectedBeat = (req, result) => {
  sql.query(`SELECT beat_id,beat_name FROM crm_dev_db.cor_beat_m where beat_assigning_form_id = '${req.body.empID}' order by beat_name`, (err, res) => {
    console.log("osbss: ", res);
    if (err) {
      result({ data: "Something Went Wrong" })
    }
    result({ data: res })
  });
};

reports.SelectOutlet_OrderHistory = (req, result) => {
  sql.query(`SELECT outlet_id,outlet_name FROM crm_dev_db.cor_outlet_m where beat_id ='${req.body.BeatID}'order by outlet_name`, (err, res) => {
    console.log("osbss: ", res);
    if (err) {
      result({ error: true, data: "Something Went Wrong" })
    }
    result({ error: false, data: res })
  });
};


reports.ManagerTeam = (req, result) => {
  sql.query(`SELECT 
    emp_id,
    user_name AS reporting_person_name
FROM 
    crm_dev_db.cor_emp_m
WHERE 
    reporting_to = '${req.body.enterBy}' 
    AND status = 'A' `, (err, res) => {
    console.log("osbss: ", res);
    if (err) {
      result({ error: true, data: "Something Went Wrong" })
    }
    result({ error: false, data: res })
  });
};





// reports.LastTwovisit_OrderHistory = (req, result) => {
//   sql.query(`
//       (
//     SELECT 
//         m.order_id AS m_orderID,
//         m.enter_date AS date, 
//         m.outlet_id,
//         m.phone_no,
//         m.employee_id,
//         m.total_quantity,
//         m.scheme_discount,
//         m.discount_amount,
//         m.enter_by,
//         d.item_id,
//         d.item_qty,
//         d.item_price_unit,
//         d.item_value,
//         d.item_gst,
//         d.order_amt,
//         d.order_gst_amt,
//         itm.sku_name,
//         itm.segment_id,
//         outlet.outlet_name,
//         NULL AS hospital_customer_name,
//         NULL AS hospital_name,
//         NULL AS activity_date,
//         NULL AS zone_id,
//         NULL AS division_m,
//         NULL AS remark, 
//         NULL AS follow_up,
//         'order' AS source
//     FROM 
//         crm_dev_db.cor_order_m m
//         JOIN crm_dev_db.cor_order_d d ON m.order_id = d.order_id
//         JOIN crm_dev_db.cor_sku_m itm ON d.item_id = itm.sku_id
//         JOIN crm_dev_db.cor_outlet_m outlet ON m.outlet_id = outlet.outlet_id
//     WHERE 
//         m.outlet_id = '${req.body.Outletid}'
//         AND m.enter_by = '${req.body.enterBy}'
//         AND DATE(m.enter_date) BETWEEN CURDATE() - INTERVAL 365 DAY AND CURDATE() - INTERVAL 1 DAY
//     ORDER BY 
//         m.enter_date DESC
//     LIMIT 2
// )
// UNION ALL
// (
//     SELECT 
//         act.id AS m_orderID, 
//         act.enter_date AS date, 
//         act.outlet_id,
//         NULL AS phone_no,
//         NULL AS employee_id,
//         NULL AS total_quantity,
//         NULL AS scheme_discount,
//         NULL AS discount_amount,
//         act.enter_by,
//         act.item_id,
//         NULL AS item_qty,
//         NULL AS item_price_unit,
//         NULL AS item_value,
//         NULL AS item_gst,
//         NULL AS order_amt,
//         NULL AS order_gst_amt,
//         itm.sku_name,
//         NULL AS segment_id,
//         NULL AS outlet_name,
//         act.hospital_customer_name,
//         act.hospital_name,
//         DATE(act.activity_date) AS activity_date, 
//         act.zone_id,
//         act.division_m,
//         act.remark, 
//         act.follow_up,
//         'activity' AS source
//     FROM 
//         crm_dev_db.cor_outlet_activity_m act
//         LEFT JOIN crm_dev_db.cor_sku_m itm ON act.item_id = itm.sku_id
//     WHERE 
//         act.outlet_id = '${req.body.Outletid}'
//         AND act.enter_by = '${req.body.enterBy}'
//     ORDER BY 
//         act.enter_date DESC
//     LIMIT 2
// )
// ORDER BY 
//     date DESC;

//     `, (err, res) => {
//     console.log("osbss: ", res);
//     if (err) {
//       result({ error: true, data: "Something Went Wrong" });
//     }
//     result({ error: false, data: res });
//   });
// };



reports.LastTwovisit_OrderHistory = (req, result) => {
  const { outlet_id, enter_by } = req.body;

  const query = `
    WITH last_order_date AS (
        SELECT DATE(MAX(enter_date)) AS visit_date
        FROM crm_dev_db.cor_order_m
        WHERE outlet_id = ? AND enter_by = ? AND DATE(enter_date) < CURRENT_DATE
    ),
    last_activity_date AS (
        SELECT DATE(MAX(enter_date)) AS visit_date
        FROM crm_dev_db.cor_outlet_activity_m
        WHERE outlet_id = ? AND enter_by = ? AND DATE(enter_date) < CURRENT_DATE
    )

    -- Orders
    SELECT 
        m.order_id AS m_orderID,
        m.enter_date AS date, 
        m.outlet_id,
        m.phone_no,
        m.employee_id,
        m.total_quantity,
        m.scheme_discount,
        m.discount_amount,
        m.enter_by,
        d.item_id,
        d.item_qty,
        d.item_price_unit,
        d.item_value,
        d.item_gst,
        d.order_amt,
        d.order_gst_amt,
        itm.sku_name,
        itm.segment_id,
        outlet.outlet_name,
        NULL AS hospital_customer_name,
        NULL AS hospital_name,
        NULL AS activity_date,
        NULL AS zone_id,
        NULL AS division_m,
        NULL AS remark, 
        NULL AS follow_up,
        'order' AS source
    FROM 
        crm_dev_db.cor_order_m m
        JOIN crm_dev_db.cor_order_d d ON m.order_id = d.order_id
        JOIN crm_dev_db.cor_sku_m itm ON d.item_id = itm.sku_id
        JOIN crm_dev_db.cor_outlet_m outlet ON m.outlet_id = outlet.outlet_id
    WHERE 
        m.outlet_id = ?
        AND m.enter_by = ?
        AND DATE(m.enter_date) = (SELECT visit_date FROM last_order_date)

    UNION ALL

    -- Activities
    SELECT 
        act.id AS m_orderID, 
        act.enter_date AS date, 
        act.outlet_id,
        NULL AS phone_no,
        NULL AS employee_id,
        NULL AS total_quantity,
        NULL AS scheme_discount,
        NULL AS discount_amount,
        act.enter_by,
        act.item_id,
        NULL AS item_qty,
        NULL AS item_price_unit,
        NULL AS item_value,
        NULL AS item_gst,
        NULL AS order_amt,
        NULL AS order_gst_amt,
        itm.sku_name,
        NULL AS segment_id,
        NULL AS outlet_name,
        act.hospital_customer_name,
        act.hospital_name,
        DATE(act.activity_date) AS activity_date, 
        act.zone_id,
        act.division_m,
        act.remark, 
        act.follow_up,
        'activity' AS source
    FROM 
        crm_dev_db.cor_outlet_activity_m act
        LEFT JOIN crm_dev_db.cor_sku_m itm ON act.item_id = itm.sku_id
    WHERE 
        act.outlet_id = ?
        AND act.enter_by = ?
        AND DATE(act.enter_date) = (SELECT visit_date FROM last_activity_date)

    ORDER BY date DESC;
  `;

  sql.query(query, [outlet_id, enter_by, outlet_id, enter_by, outlet_id, enter_by, outlet_id, enter_by], (err, res) => {
    if (err) {
      console.log("Error:", err);
      return result({ error: true, data: "Something Went Wrong" });
    }
    result({ error: false, data: res });
  });
};



reports.Eodfetch = (req, result) => {
  let query = `
    SELECT 
      m.order_id AS m_orderID,
      m.enter_date AS date, 
      m.outlet_id,
      m.phone_no,
      m.employee_id,
      m.total_quantity,
      m.scheme_discount,
      m.discount_amount,
      m.enter_by,
      d.item_id,
      d.item_qty,
      d.item_price_unit,
      d.item_value,
      d.item_gst,
      d.order_amt,
      d.order_gst_amt,
      itm.sku_name,
      itm.segment_id,
      outlet.outlet_name,
      NULL AS hospital_customer_name,
      NULL AS hospital_name,
      NULL AS activity_date,
      NULL AS zone_id,
      NULL AS division_m,
      NULL AS remark,
      NULL AS follow_up,  
      'order' AS source
    FROM 
      crm_dev_db.cor_order_m m
      JOIN crm_dev_db.cor_order_d d ON m.order_id = d.order_id
      JOIN crm_dev_db.cor_sku_m itm ON d.item_id = itm.sku_id
      JOIN crm_dev_db.cor_outlet_m outlet ON m.outlet_id = outlet.outlet_id
    WHERE 
      m.enter_by = ?`;

  let params = [req.body.enterBy];

  if (req.body.Outletid) {
    query += ` AND m.outlet_id = ?`;
    params.push(req.body.Outletid);
  }

  query += ` AND DATE(m.enter_date) = CURDATE()
  
    UNION ALL
  
    SELECT 
      act.id AS m_orderID, 
      act.enter_date AS date, 
      act.outlet_id,
      NULL AS phone_no,
      NULL AS employee_id,
      NULL AS total_quantity,
      NULL AS scheme_discount,
      NULL AS discount_amount,
      act.enter_by,
      act.item_id,
      NULL AS item_qty,
      NULL AS item_price_unit,
      NULL AS item_value,
      NULL AS item_gst,
      NULL AS order_amt,
      NULL AS order_gst_amt,
      itm.sku_name,
      NULL AS segment_id,
      NULL AS outlet_name,
      act.hospital_customer_name,
      act.hospital_name,
      DATE(act.activity_date) AS activity_date, 
      act.zone_id,
      act.division_m,
      act.remark, 
      act.follow_up,  
      'activity' AS source
    FROM 
      crm_dev_db.cor_outlet_activity_m act
      LEFT JOIN crm_dev_db.cor_sku_m itm ON act.item_id = itm.sku_id
    WHERE 
      act.enter_by = ?`;

  params.push(req.body.enterBy);

  if (req.body.Outletid) {
    query += ` AND act.outlet_id = ?`;
    params.push(req.body.Outletid);
  }

  query += ` AND DATE(act.enter_date) = CURDATE()`;

  sql.query(query, params, (err, res) => {
    if (err) {
      return result({ error: true, data: "Something Went Wrong" });
    }
    result({ error: false, data: res });
  });
};

reports.getOrdersAndActivitiesByDate = (req, result) => {
  const enter_by = req.body.enterBy;
  const selected_date = req.body.enter_date;

  const query = `
  (
    SELECT 
        outlet.outlet_name,
        TIME_FORMAT(CONVERT_TZ(m.enter_date, '+00:00', 'Asia/Kolkata'), '%h:%i %p') AS date,
        m.order_lat AS lat, 
        m.order_lag AS lng, 
        'O' AS source
    FROM 
        crm_dev_db.cor_order_m m
        JOIN crm_dev_db.cor_outlet_m outlet ON m.outlet_id = outlet.outlet_id
    WHERE 
        m.enter_by = ? 
        AND DATE(m.enter_date) = ?
        AND m.order_lat IS NOT NULL AND m.order_lat <> '' AND m.order_lat <> '...'
        AND m.order_lag IS NOT NULL AND m.order_lag <> '' AND m.order_lag <> '...'
  )
  UNION ALL
  (
    SELECT 
        outlet.outlet_name,
        TIME_FORMAT(CONVERT_TZ(act.enter_date, '+00:00', 'Asia/Kolkata'), '%h:%i %p') AS date,
        act.act_lat AS lat, 
        act.act_long AS lng, 
        'A' AS source
    FROM 
        crm_dev_db.cor_outlet_activity_m act
        LEFT JOIN crm_dev_db.cor_outlet_m outlet ON act.outlet_id = outlet.outlet_id
    WHERE 
        act.enter_by = ? 
        AND DATE(act.enter_date) = ?
        AND act.act_lat IS NOT NULL AND act.act_lat <> '' AND act.act_lat <> '...'
        AND act.act_long IS NOT NULL AND act.act_long <> '' AND act.act_long <> '...'
  )
  ORDER BY 
      date ASC;
`;


  sql.query(query, [enter_by, selected_date, enter_by, selected_date], async (err, res) => {
    if (err) {
      console.error("Query Error:", err);
      return result({ error: true, data: "Something Went Wrong" });
    }

    for (const item of res) {
      if (item.lat && item.lng) {
        item.address = await getAddress(item.lat, item.lng);
      } else {
        item.address = "Location not available";
      }
    }

    // Return the updated result
    return result({ error: false, data: res });
  });
};

//getting address by using lat log
const getAddress = async (lat, long) => {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=AIzaSyBD_oiY_TqpxQCYs_LtydY-bcPPlxig6iM`;
    const response = await fetch(url);
    const data = await response.json();


    if (data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    return "Address not found";
  } catch (error) {
    console.error("Error fetching address:", error);
    return "Error fetching address";
  }
};

//external apis
// reports.getOrdersAndActivitiesByDateAddress = async (req, res) => {
//   const enter_by = req.query.enterBy;
//   const selected_date = req.query.enter_date;

//   const query = `
//     (
//       SELECT 
//           outlet.outlet_name,
//           TIME_FORMAT(CONVERT_TZ(m.enter_date, '+00:00', 'Asia/Kolkata'), '%h:%i %p') AS date,
//           m.order_lat AS lat, 
//           m.order_lag AS lng, 
//           'O' AS source
//       FROM 
//           crm_dev_db.cor_order_m m
//           JOIN crm_dev_db.cor_outlet_m outlet ON m.outlet_id = outlet.outlet_id
//       WHERE 
//           m.enter_by = ? 
//           AND DATE(m.enter_date) = ? 
//     )
//     UNION ALL
//     (
//       SELECT 
//           outlet.outlet_name,
//           TIME_FORMAT(CONVERT_TZ(act.enter_date, '+00:00', 'Asia/Kolkata'), '%h:%i %p') AS date,
//           act.act_lat AS lat, 
//           act.act_long AS lng, 
//           'A' AS source
//       FROM 
//           crm_dev_db.cor_outlet_activity_m act
//           LEFT JOIN crm_dev_db.cor_outlet_m outlet ON act.outlet_id = outlet.outlet_id
//       WHERE 
//           act.enter_by = ? 
//           AND DATE(act.enter_date) = ? 
//     )
//     ORDER BY 
//         date ASC;
//   `;

//   sql.query(query, [enter_by, selected_date, enter_by, selected_date], async (err, data) => {
//     if (err) {
//       console.error("Query Error:", err);
//       return res.status(500).send("Something went wrong");
//     }

//     try {
//       // Add addresses for each location
//       for (const item of data) {
//         if (item.lat && item.lng) {
//           item.address = await getAddress(item.lat, item.lng);  // Make sure `getAddress` is properly async
//         } else {
//           item.address = "Location not available";
//         }
//       }

//       // Prepare the CSV
//       const fields = ['outlet_name', 'date', 'lat', 'lng', 'source', 'address'];
//       const json2csvParser = new Parser({ fields });
//       const csv = json2csvParser.parse(data);

//       // Ensure the directory exists before writing the file
//       const reportDir = path.join(__dirname, './reports');
//       if (!fs.existsSync(reportDir)) {
//         fs.mkdirSync(reportDir, { recursive: true });
//       }

//       // Define file path for the report
//       const filePath = path.join(reportDir, `report_${Date.now()}.csv`);

//       // Write CSV to file
//       fs.writeFileSync(filePath, csv);

//       // Send the file as a download
//       res.download(filePath, (err) => {
//         if (err) {
//           console.error("File Download Error:", err);
//           return res.status(500).send("Error in downloading file");
//         }

//         // Cleanup the file after sending it
//         fs.unlinkSync(filePath); // Delete the file after download
//       });

//     } catch (csvError) {
//       console.error("CSV Generation Error:", csvError);
//       return res.status(500).send("CSV generation failed");
//     }
//   });
// };




reports.OrderHistory_MIS = (req, result) => {
  console.log('Request Body:', req.body);

  sql.query(
    `SELECT m.order_id, m.order_date , m.order_time, item_id, 
      SUM(item_qty) qty, ROUND(SUM(item_price_unit), 2) unit,  
      ROUND(SUM(order_amt), 2) taxable_value, item_gst, 
      ROUND(SUM(order_gst_amt), 2) gst,
      ROUND(SUM(order_amt), 2) + ROUND(SUM(order_gst_amt), 2) tot_amt,
      itm.sku_name, outlet.outlet_name
    FROM crm_dev_db.cor_order_m m
    JOIN crm_dev_db.cor_order_d d ON m.order_id = d.order_id
    JOIN crm_dev_db.cor_sku_m itm ON d.item_id = itm.sku_id
    JOIN crm_dev_db.cor_outlet_m outlet ON m.outlet_id = outlet.outlet_id
    WHERE m.outlet_id = '${req.body.Outletid}' 
      AND m.order_date BETWEEN '${req.body.fromDate}' AND '${req.body.toDate}' 
      AND m.employee_id = '${req.body.enterBy}'
    GROUP BY m.order_id, m.order_date, item_id, item_gst;`,
    (err, res) => {
      if (err) {
        return result({ error: true, data: "Something Went Wrong" });
      }

      // Transform the response into key-value format
      let formattedData = {};
      res.forEach(order => {
        // Format the date as DD-MM-YYYY
        let formattedDate = new Date(order.order_date)
          .toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" }) // Fix timezone issue
          .split("/")
          .join("-"); // Format as DD-MM-YYYY

        // Get the weekday (e.g., "Monday")
        let weekday = new Date(order.order_date)
          .toLocaleString('en-GB', { weekday: 'long', timeZone: 'Asia/Kolkata' });

        // Combine the formatted date with the weekday
        let dateWithDay = `${formattedDate}, ${weekday}`;

        if (!formattedData[dateWithDay]) {
          formattedData[dateWithDay] = [];
        }
        formattedData[dateWithDay].push(order);
      });

      result({ error: false, data: formattedData });
    }
  );
};




// reports.OrderHistory_MIS = (req, result) => {
//   console.log('gyhgyuhyuh',req.body);

//   sql.query(`SELECT m.order_id, m.order_date , m.order_time, item_id,sum(item_qty) qty , round(sum(item_price_unit),2) unit ,  round(sum(order_amt),2)   taxable_value ,item_gst,round(sum(order_gst_amt),2) gst,
//     round(sum(order_amt),2) +round(sum(order_gst_amt),2) tot_amt,itm.sku_name,outlet.outlet_name
//     FROM crm_dev_db.cor_order_m m,crm_dev_db.cor_order_d d , crm_dev_db.cor_sku_m itm,crm_dev_db.cor_outlet_m outlet
//     where  m.order_id=d.order_id and m.outlet_id=outlet.outlet_id  and m.outlet_id='${req.body.Outletid}' and d.item_id=itm.sku_id and m.order_date between '${req.body.fromDate}' AND '${req.body.toDate}' and m.employee_id='${req.body.enterBy}'
//     group by m.order_id, m.order_date,item_id,item_gst;`, (err, res) => {
//     console.log("response here===========>: ", res);
//     if (err) {
//       result({ error: true, data: "Something Went Wrong" })
//     }
//     result({ error: false, data: res })
//   });
// };


// reports.OrderHistory_MIS = (req, result) => {
//   console.log('gyhgyuhyuh',req.body);

//   sql.query(`SELECT m.order_id, m.order_date , m.order_time, item_id,sum(item_qty) qty , round(sum(item_price_unit),2) unit ,  round(sum(order_amt),2)   taxable_value ,item_gst,round(sum(order_gst_amt),2) gst,
//     round(sum(order_amt),2) +round(sum(order_gst_amt),2) tot_amt,itm.sku_name,outlet.outlet_name
//     FROM crm_dev_db.cor_order_m m,crm_dev_db.cor_order_d d , crm_dev_db.cor_sku_m itm,crm_dev_db.cor_outlet_m outlet
//     where  m.order_id=d.order_id and m.outlet_id=outlet.outlet_id  and m.outlet_id='${req.body.Outletid}' and d.item_id=itm.sku_id and m.order_date between '${req.body.fromDate}' AND '${req.body.toDate}' and m.employee_id='${req.body.enterBy}'
//     group by m.order_id, m.order_date,item_id,item_gst;`, (err, res) => {
//     console.log("response here===========>: ", res);
//     if (err) {
//       result({ error: true, data: "Something Went Wrong" })
//     }
//     result({ error: false, data: res })
//   });
// };


reports.Selectdate = (req, result) => {
  sql.query(`SELECT ol.outlet_name,o.order_time,o.status,o.scheme_discount,o.total_quantity
    FROM crm_dev_db.cor_order_m as o
    LEFT JOIN crm_dev_db.cor_outlet_m as ol
    ON o.outlet_id = ol.outlet_id
    where o.outlet_id = '${req.body.Outletids}'`, (err, res) => {
    console.log("osbss: ", res);
    if (err) {
      result({ error: true, data: "Something Went Wrong" })
    }
    result({ error: false, data: res })
  });
};

//////acvtivity

// reports.ActivityHistory_MIS = (req, result) => {
//   console.log('activityyy', req.body);

//   sql.query(`SELECT sku.sku_name,act.item_id,act.user_type,act.remark,act.follow_up,act.enter_date,act.hospital_customer_name,act.hospital_name
//     FROM crm_dev_db.cor_outlet_activity_m as act
//     LEFT JOIN crm_dev_db.cor_sku_m as sku
//     ON act.item_id = sku.sku_id
//     where act.outlet_id = '${req.body.Outletid}' and act.enter_by='${req.body.enterBy}' and act.activity_date between '${req.body.fromDate}' AND '${req.body.toDate}'`, (err, res) => {
//     console.log("osbss: ", res);
//     if (err) {
//       result({ error: true, data: "Something Went Wrong" })
//     }
//     result({ error: false, data: res })
//   });
// };

reports.ActivityHistory_MIS = (req, result) => {
  console.log('activityyy', req.body);

  sql.query(`SELECT sku.sku_name, act.item_id, act.user_type, act.remark, act.follow_up, act.enter_date, 
                    act.hospital_customer_name, act.hospital_name
             FROM crm_dev_db.cor_outlet_activity_m as act
             LEFT JOIN crm_dev_db.cor_sku_m as sku
             ON act.item_id = sku.sku_id
             WHERE act.outlet_id = '${req.body.Outletid}' 
             AND act.enter_by = '${req.body.enterBy}' 
             AND act.activity_date BETWEEN '${req.body.fromDate}' AND '${req.body.toDate}'`,
    (err, res) => {
      if (err) {
        return result({ error: true, data: "Something Went Wrong" });
      }

      // Transform the response into key-value format, grouped by enter_date
      let formattedData = {};
      res.forEach(activity => {
        // Format the enter_date as DD-MM-YYYY
        let formattedDate = new Date(activity.enter_date)
          .toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" }) // Fix timezone issue
          .split("/")
          .join("-"); // Format as DD-MM-YYYY

        // Get the weekday (e.g., "Monday")
        let weekday = new Date(activity.enter_date)
          .toLocaleString('en-GB', { weekday: 'long', timeZone: 'Asia/Kolkata' });

        // Combine the formatted date with the weekday
        let dateWithDay = `${formattedDate}, ${weekday}`;

        if (!formattedData[dateWithDay]) {
          formattedData[dateWithDay] = [];
        }
        formattedData[dateWithDay].push(activity);
      });

      result({ error: false, data: formattedData });
    }
  );
};


reports.SelectActivitydate = (req, result) => {
  sql.query(`SELECT DISTINCT act.enter_date,ol.outlet_name
    FROM crm_dev_db.cor_outlet_activity_m as act
    LEFT JOIN crm_dev_db.cor_outlet_m as ol
    ON act.outlet_id = ol.outlet_id
    where act.outlet_id = '${req.body.Outletids}' and act.enter_by='${req.body.enterBy}'`,
    console.log(`SELECT DISTINCT act.enter_date,ol.outlet_name
    FROM crm_dev_db.cor_outlet_activity_m as act
    LEFT JOIN crm_dev_db.cor_outlet_m as ol
    ON act.outlet_id = ol.outlet_id
    where act.outlet_id = '${req.body.Outletids}' and act.enter_by='${req.body.enterBy}'`), (err, res) => {
    console.log("osbss: ", res);
    if (err) {
      result({ error: true, data: "Something Went Wrong" })
    }
    result({ error: false, data: res })
  });
};

reports.AttendanceHistory = (req, result) => {
  sql.query(`SELECT punch_date, punch_in, punch_out, leave_status, leave_type, holiday_status, holiday ,concat(CASE WHEN TIMESTAMPDIFF(HOUR, punch_in, punch_out)=0 THEN '00' ELSE TIMESTAMPDIFF(HOUR, punch_in, punch_out) END,':',TIMESTAMPDIFF(MINUTE, punch_in, punch_out)) TOT_HRS FROM crm_dev_db.cor_attendance_m WHERE punch_date between '${req.body.fromDate}' AND '${req.body.toDate}' and enter_by='${req.body.enterBy}'`, (err, res) => {
    console.log("osbss: ", res);
    if (err) {
      result({ error: true, data: "Something Went Wrong" })
    }
    result({ error: false, data: res })
  });
};



reports.monthlyAttendance = (req, result) => {
  sql.query(`SELECT 
    IFNULL(a.attendance_id, NULL) AS attendance_id,
    d.punch_date, 
    DATE_FORMAT(CONVERT_TZ(a.punch_in, 'UTC', 'Asia/Kolkata'), '%h:%i %p') AS punch_in_time,
DATE_FORMAT(CONVERT_TZ(a.punch_out, 'UTC', 'Asia/Kolkata'), '%h:%i %p') AS punch_out_time,
    e.emp_id,
    TRIM(e.emp_code) AS emp_code, 
    TRIM(e.user_name) AS user_name, 
    'RGPL' AS company_name,

    -- Attendance status logic
    CASE
        WHEN h.date IS NOT NULL AND DAYOFWEEK(h.date) = 1 
             AND a.punch_in IS NULL AND a.punch_out IS NULL THEN 'WEO' 
        WHEN h.date IS NOT NULL AND a.punch_in IS NULL 
             AND a.punch_out IS NULL THEN 'PHY' 
        WHEN a.leave_status = 2 THEN 'L'
        WHEN a.leave_status = 1 THEN 'A'
        WHEN e.state_id = 39 AND DAYOFWEEK(d.punch_date) = 7 
             AND a.punch_in IS NULL AND a.punch_out IS NULL THEN 'WEO' 
        WHEN DAYOFWEEK(d.punch_date) = 1 
             AND a.punch_in IS NULL AND a.punch_out IS NULL THEN 'WEO' 
        WHEN a.punch_in IS NULL AND a.punch_out IS NULL THEN 'A' 
            WHEN a.status = 1 AND TIME(CONVERT_TZ(a.punch_in, 'UTC', 'Asia/Kolkata')) > '10:30:00' THEN 'ABSHD'
        WHEN a.status = 1 AND TIMESTAMPDIFF(HOUR, a.punch_in, a.punch_out) >= 8 THEN 'P' 
        WHEN a.status = 1 AND TIMESTAMPDIFF(HOUR, a.punch_in, a.punch_out) >= 4 THEN 'ABSHD' 
        ELSE 'A' 
    END AS attendance_status,

    -- Leave type logic
    CASE 
        WHEN a.leave_status = 2 THEN COALESCE(l.leave_type, '0')  
        ELSE '0'  
    END AS leave_type,

    -- Total hours worked
    IF(a.status = 1 AND a.punch_in IS NOT NULL AND a.punch_out IS NOT NULL,
  CONCAT(
    LPAD(FLOOR(
      TIMESTAMPDIFF(
        MINUTE,
        CONVERT_TZ(a.punch_in, 'UTC', 'Asia/Kolkata'),
        CONVERT_TZ(a.punch_out, 'UTC', 'Asia/Kolkata')
      ) / 60
    ), 2, '0'),
    'h:',
    LPAD(
      MOD(
        TIMESTAMPDIFF(
          MINUTE,
          CONVERT_TZ(a.punch_in, 'UTC', 'Asia/Kolkata'),
          CONVERT_TZ(a.punch_out, 'UTC', 'Asia/Kolkata')
        ), 60
      ), 2, '0'
    ),
    'm'
  ),
  '00h:00m'
) AS total_hours


FROM 
    (SELECT 
        DATE(CONCAT(YEAR('${req.body.selectedDate}'), '-', MONTH('${req.body.selectedDate}'), '-', daynum)) AS punch_date
     FROM 
        (SELECT 1 AS daynum UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION 
         SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION 
         SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION 
         SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20 UNION 
         SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25 UNION 
         SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29 UNION SELECT 30 UNION SELECT 31) days
     WHERE 
        daynum <= DAY(LEAST(CURRENT_DATE, LAST_DAY('${req.body.selectedDate}')))
    ) d
LEFT JOIN 
    crm_dev_db.cor_emp_m e ON 1 = 1
LEFT JOIN 
    crm_dev_db.cor_attendance_m a ON e.emp_id = a.emp_id 
    AND a.punch_date = d.punch_date
LEFT JOIN 
    crm_dev_db.cor_leave_m l ON e.emp_id = l.emp_id 
    AND l.start_date <= d.punch_date 
    AND (l.end_date >= d.punch_date OR l.end_date IS NULL)
LEFT JOIN
    crm_dev_db.cor_holiday_m h ON FIND_IN_SET(e.state_id, h.state_id) > 0
    AND h.date = d.punch_date
WHERE 
    e.status = 'A'
    AND e.emp_id = '${req.body.empid}'   -- Specific employee ID condition
ORDER BY 
    d.punch_date;
`,

    (err, res) => {
      console.log("Query Result: ", res);
      if (err) {
        console.error("Error: ", err);
        return result({ error: true, data: "Something Went Wrong" });
      }
      result({ error: false, data: res });
    });
};






/////EOD

// reports.EodDate =  (req, result) => {
//   sql.query( `SELECT distinct m.order_date,m.outlet_id,m.total_quantity,m.scheme_discount,outlet.outlet_name,m.order_time FROM crm_dev_db.cor_order_m m , crm_dev_db.cor_outlet_m outlet where DATE(m.order_date) = CURDATE() and m.enter_by = '${req.body.enterBy}' and m.outlet_id=outlet.outlet_id`, (err, res) => {
//     console.log("osbss: ", res);
//     if (err) {
//       result({ error: true, data: "Something Went Wrong" })
//     }
//     result({ error: false, data: res })
//   });
// };

reports.EodDate = (req, result) => {
  sql.query(`SELECT distinct m.outlet_id,outlet.outlet_name,m.total_quantity,m.order_id,m.call_type,m.joined_name,m.dealer_id,dealer.dealer_name FROM 
    crm_dev_db.cor_order_m m , crm_dev_db.cor_outlet_m outlet,crm_dev_db.cor_dealer_m dealer  where DATE(m.order_date) = CURDATE() 
    and m.enter_by = '${req.body.enterBy}' and m.outlet_id=outlet.outlet_id and dealer.dealer_id=m.dealer_id`, (err, res) => {
    console.log("osbss: ", res);
    if (err) {
      result({ error: true, data: "Something Went Wrong" })
    }
    result({ error: false, data: res })
  });
};


/////////EodDate After Button Click

reports.EodDatebutton = (req, result) => {
  sql.query(`SELECT distinct m.outlet_id,outlet.outlet_name,m.total_quantity,m.order_id FROM 
    crm_dev_db.cor_order_m m , crm_dev_db.cor_outlet_m outlet where m.order_date = '${req.body.enterDate}' 
    and m.enter_by = '${req.body.enterBy}' and m.outlet_id=outlet.outlet_id`, (err, res) => {
    console.log("osbss: ", res);
    if (err) {
      result({ error: true, data: "Something Went Wrong" })
    }
    result({ error: false, data: res })
  });
};


reports.EodOrder = (req, result) => {
  sql.query(`select m.order_id as m_orderID,m.order_date,m.outlet_id,m.phone_no,m.employee_id,m.total_quantity,m.scheme_discount,
    m.discount_amount,m.enter_by ,d.item_id,d.item_qty,d.item_price_unit,d.item_value,d.item_gst,d.order_amt,
    d.order_gst_amt,itm.sku_name,itm.segment_id,outlet.outlet_name,m.call_type,m.joined_name
     FROM crm_dev_db.cor_order_m m,crm_dev_db.cor_order_d d , crm_dev_db.cor_sku_m itm ,crm_dev_db.cor_outlet_m outlet
     WHERE m.order_id=d.order_id and m.outlet_id=outlet.outlet_id and  d.item_id=itm.sku_id and DATE(m.order_date) = CURDATE() and m.enter_by = '${req.body.enterBy}'`,
    console.log(`select m.order_id as m_orderID,m.order_date,m.outlet_id,m.phone_no,m.employee_id,m.total_quantity,m.scheme_discount,
     m.discount_amount,m.enter_by ,d.item_id,d.item_qty,d.item_price_unit,d.item_value,d.item_gst,d.order_amt,
     d.order_gst_amt,itm.sku_name,itm.segment_id,outlet.outlet_name
      FROM crm_dev_db.cor_order_m m,crm_dev_db.cor_order_d d , crm_dev_db.cor_sku_m itm ,crm_dev_db.cor_outlet_m outlet
      WHERE m.order_id=d.order_id and m.outlet_id=outlet.outlet_id and  d.item_id=itm.sku_id and DATE(m.order_date) = CURDATE() and m.enter_by = '${req.body.enterBy}'`), (err, res) => {
    console.log("osbss: ", res);
    if (err) {
      result({ error: true, data: "Something Went Wrong" })
    }
    result({ error: false, data: res })
  });
};

/////buttonCLick

reports.EodOrderbutton = (req, result) => {
  sql.query(`select m.order_id as m_orderID,m.order_date,m.outlet_id,m.phone_no,m.employee_id,m.total_quantity,m.scheme_discount,m.call_type,m.joined_name,
    m.discount_amount,m.enter_by ,d.item_id,d.item_qty,d.item_price_unit,d.item_value,d.item_gst,d.order_amt,
    d.order_gst_amt,itm.sku_name,itm.segment_id,outlet.outlet_name
     FROM crm_dev_db.cor_order_m m,crm_dev_db.cor_order_d d , crm_dev_db.cor_sku_m itm ,crm_dev_db.cor_outlet_m outlet
     WHERE m.order_id=d.order_id and m.outlet_id=outlet.outlet_id and  d.item_id=itm.sku_id and m.order_date = '${req.body.enterDate}'  and m.enter_by = '${req.body.enterBy}'`, (err, res) => {
    console.log("osbss: ", res);
    if (err) {
      result({ error: true, data: "Something Went Wrong" })
    }
    result({ error: false, data: res })
  });
};

//////////

reports.EodDateReturn = (req, result) => {
  sql.query(`SELECT distinct m.order_return__date,m.outlet_id,m.order_return_id as m_return_orderID,outlet.outlet_name,m.order_return_time,m.total_quantity,m.scheme_discount
    FROM crm_dev_db.cor_order_return_m m , crm_dev_db.cor_outlet_m outlet where DATE(m.order_return__date) = CURDATE() 
    and m.enter_by = '${req.body.enterBy}' and m.outlet_id=outlet.outlet_id`, (err, res) => {
    console.log("osbss: ", res);
    if (err) {
      result({ error: true, data: "Something Went Wrong" })
    }
    result({ error: false, data: res })
  });
};

/////button click

reports.EodDateReturnbutton = (req, result) => {
  sql.query(`SELECT distinct m.order_return__date,m.order_return_id as m_return_orderID,m.outlet_id,outlet.outlet_name,m.order_return_time,m.total_quantity,m.scheme_discount
    FROM crm_dev_db.cor_order_return_m m , crm_dev_db.cor_outlet_m outlet where m.order_return__date = '${req.body.enterDate}'
    and m.enter_by = '${req.body.enterBy}' and m.outlet_id=outlet.outlet_id`, (err, res) => {
    console.log("osbss: ", res);
    if (err) {
      result({ error: true, data: "Something Went Wrong" })
    }
    result({ error: false, data: res })
  });
};

reports.EodReturn = (req, result) => {
  sql.query(`select m.order_return_id as m_return_orderID,m.order_return__date,m.outlet_id,m.phone_no,m.employee_id,m.total_quantity,m.scheme_discount,
    m.discount_amount,m.enter_by ,d.item_id,d.item_qty,d.item_price_unit,d.item_value,d.item_gst,d.return_order_amt,d.order_return_reason,
    d.return_order_gst_amt,itm.sku_name,itm.segment_id,outlet.outlet_name
     FROM crm_dev_db.cor_order_return_m m,crm_dev_db.cor_order_return_d d , crm_dev_db.cor_sku_m itm ,crm_dev_db.cor_outlet_m outlet
     WHERE m.order_return_id=d.order_return_id and m.outlet_id=outlet.outlet_id and  d.item_id=itm.sku_id and DATE(m.order_return__date) = CURDATE() and m.enter_by = '${req.body.enterBy}'`, (err, res) => {
    console.log("osbss: ", res);
    if (err) {
      result({ error: true, data: "Something Went Wrong" })
    }
    result({ error: false, data: res })
  });
};

///////////////button click

reports.EodReturnbutton = (req, result) => {
  sql.query(`select m.order_return_id as m_return_orderID,m.order_return__date,m.outlet_id,m.phone_no,m.employee_id,m.total_quantity,m.scheme_discount,
    m.discount_amount,m.enter_by ,d.item_id,d.item_qty,d.item_price_unit,d.item_value,d.item_gst,d.return_order_amt,d.order_return_reason,
    d.return_order_gst_amt,itm.sku_name,itm.segment_id,outlet.outlet_name
     FROM crm_dev_db.cor_order_return_m m,crm_dev_db.cor_order_return_d d , crm_dev_db.cor_sku_m itm ,crm_dev_db.cor_outlet_m outlet
     WHERE m.order_return_id=d.order_return_id and m.outlet_id=outlet.outlet_id and  d.item_id=itm.sku_id and m.order_return__date = '${req.body.enterDate}' and m.enter_by = '${req.body.enterBy}'`, (err, res) => {
    console.log("osbss: ", res);
    if (err) {
      result({ error: true, data: "Something Went Wrong" })
    }
    result({ error: false, data: res })
  });
};

// reports.ActivityData =  (req, result) => {
//   sql.query( `SELECT * FROM crm_dev_db.cor_outlet_activity_m where DATE(activity_date) = CURDATE() and enter_by = '${req.body.enterBy}'`, (err, res) => {
//     console.log("osbss: ", res);
//     if (err) {
//       result({ error: true, data: "Something Went Wrong" })
//     }
//     result({ error: false, data: res })
//   });
// };

////////////////////////
reports.ActivityData = (req, result) => {
  sql.query(`SELECT act.id,itm.sku_name,act.outlet_id,act.item_id,act.enter_by,act.user_type,act.remark,act.call_type, act.joined_name,act.follow_up,act.enter_date,act.hospital_customer_name,act.hospital_name,act.activity_date,act.zone_id,act.division_m,itm.sku_name
    FROM crm_dev_db.cor_outlet_activity_m act
    LEFT JOIN crm_dev_db.cor_sku_m itm ON act.item_id = itm.sku_id
    where  DATE(act.activity_date) = CURDATE() and act.enter_by = '${req.body.enterBy}'`, (err, res) => {
    console.log("osbss: ", res);
    if (err) {
      result({ error: true, data: "Something Went Wrong" })
    }
    result({ error: false, data: res })
  });
};
/////////////button click

reports.ActivityDatabutton = (req, result) => {
  sql.query(`SELECT act.id,act.outlet_id,act.item_id,act.enter_by,act.user_type,act.remark,act.call_type, act.joined_name,
act.follow_up,act.enter_date,act.hospital_customer_name,act.hospital_name,act.activity_date,act.zone_id,act.division_m,itm.sku_name
     FROM crm_dev_db.cor_outlet_activity_m act , crm_dev_db.cor_sku_m itm  where act.item_id=itm.sku_id and act.activity_date = '${req.body.enterDate}' and act.enter_by = '${req.body.enterBy}'`, (err, res) => {
    console.log("osbss: ", res);
    if (err) {
      result({ error: true, data: "Something Went Wrong" })
    }
    result({ error: false, data: res })
  });
};

// reports.EODActivityDate =  (req, result) => {
//   sql.query( `SELECT distinct m.outlet_id,m.item_id,m.enter_by,m.user_type,m.remark,m.follow_up,m.activity_date,m.enter_date,m.hospital_customer_name,m.hospital_name,outlet.outlet_name
//   FROM crm_dev_db.cor_outlet_activity_m m
//   LEFT JOIN crm_dev_db.cor_outlet_m outlet
//   ON m.outlet_id = outlet.outlet_id where DATE(m.activity_date) = CURDATE() and m.enter_by = '${req.body.enterBy}'`, (err, res) => {
//     console.log("osbss: ", res);
//     if (err) {
//       result({ error: true, data: "Something Went Wrong" })
//     }
//     result({ error: false, data: res })
//   });
// };

reports.EODActivityDate = (req, result) => {
  sql.query(`SELECT distinct m.outlet_id,outlet.outlet_name
    FROM crm_dev_db.cor_outlet_activity_m m
    LEFT JOIN crm_dev_db.cor_outlet_m outlet
    ON m.outlet_id = outlet.outlet_id where DATE(m.activity_date) = CURDATE() and m.enter_by = '${req.body.enterBy}'`, (err, res) => {
    console.log("osbss: ", res);
    if (err) {
      result({ error: true, data: "Something Went Wrong" })
    }
    result({ error: false, data: res })
  });
};


/////////button click

reports.EODActivityDatebutton = (req, result) => {
  sql.query(`SELECT distinct m.outlet_id,outlet.outlet_name
    FROM crm_dev_db.cor_outlet_activity_m m
    LEFT JOIN crm_dev_db.cor_outlet_m outlet
    ON m.outlet_id = outlet.outlet_id where m.activity_date = '${req.body.enterDate}' and m.enter_by = '${req.body.enterBy}'`, (err, res) => {
    console.log("osbss: ", res);
    if (err) {
      result({ error: true, data: "Something Went Wrong" })
    }
    result({ error: false, data: res })
  });
};

//when page open then show punch in punch out 
reports.EODAttendance = (req, result) => {
  sql.query(`SELECT punch_in , punch_out FROM crm_dev_db.cor_attendance_m where DATE(enter_date) = CURDATE() and emp_id='${req.body.enterBy}'`, (err, res) => {
    console.log("osbss: ", res);
    if (err) {
      result({ error: true, data: "Something Went Wrong" })
    }
    result({ error: false, data: res })
  });
};



reports.Teamlink = (req, result) => {
  sql.query(`
    SELECT 
      e.user_name,
      dsg.designation_name,  -- Fetching designation_name from cor_designation_m
      e.Head_Quater_name,
      divm.division_name,  -- Fetching division_name from cor_division_m
      a.punch_date AS last_eod_date,
      a.eod AS last_eod,
      CASE 
        WHEN a.eod = 'Y' THEN 'Submitted'
        WHEN a.eod = 'N' THEN 'Not Submitted'
        ELSE 'Null' 
      END AS eod_status
    FROM 
      crm_dev_db.cor_emp_m e
    LEFT JOIN crm_dev_db.cor_division_m divm 
      ON e.division = divm.division_id  -- Joining with division_id
    LEFT JOIN crm_dev_db.cor_designation_m dsg 
      ON e.designation = dsg.designation_id  -- Joining with designation_id
    LEFT JOIN crm_dev_db.cor_attendance_m a 
      ON a.emp_id = e.emp_id
      AND a.punch_date = (
        SELECT MAX(a2.punch_date)
        FROM crm_dev_db.cor_attendance_m a2
        WHERE a2.emp_id = e.emp_id
        AND a2.punch_date < CURDATE()  -- Exclude today's data
      )
    WHERE 
      e.reporting_to = '${req.body.empidd}'  
      AND e.status = 'A';
  `, (err, res) => {
    console.log("Result: ", res);
    if (err) {
      result({ error: true, data: "Something Went Wrong" });
    } else {
      result({ error: false, data: res });
    }
  });
};




// reports.Leaveapproval = (req, result) => {
//   console.log("Leave Approval is hitting");

//   sql.query(`
//     SELECT 
//       l.*, 
//       e.user_name  
//     FROM 
//       crm_dev_db.cor_leave_m l
//     JOIN 
//       crm_dev_db.cor_emp_m e 
//       ON l.emp_id = e.emp_id 
//     WHERE 
//       l.reporting_to = '${req.body.empidd}' 
//       AND l.enter_date >= DATE_SUB(CURDATE(), INTERVAL 60 DAY);
//   `, (err, res) => {
//     console.log("Result: ", res);
//     if (err) {
//       result({ error: true, data: "Something Went Wrong" });
//     } else {
//       result({ error: false, data: res });
//     }
//   });
// };



reports.Leaveapproval = (req, result) => {
  console.log("Leave Approval is hitting");

  sql.query(`
    SELECT 
      l.*, 
      l.leave_reason,
      e.user_name  
    FROM 
      crm_dev_db.cor_leave_m l
    JOIN 
      crm_dev_db.cor_emp_m e 
      ON l.emp_id = e.emp_id 
    WHERE 
      l.reporting_to = '${req.body.empidd}' 
      AND l.enter_date >= DATE_SUB(CURDATE(), INTERVAL 60 DAY)
      AND l.approved_by IS NULL 
      AND l.approved_date IS NULL;  
  `, (err, res) => {


    if (err) {
      result({ error: true, data: "Something Went Wrong" });
    } else {
      result({ error: false, data: res });
    }
  });
};


reports.Leaveapprovallist = (req, result) => {
  console.log("Leave Approval is hitting");

  sql.query(`
    SELECT 
    l.*, 
    l.leave_reason,
    e.user_name  
FROM 
    crm_dev_db.cor_leave_m l
JOIN 
    crm_dev_db.cor_emp_m e 
    ON l.emp_id = e.emp_id 
WHERE 
    l.reporting_to = '${req.body.empidd}' 
    AND l.enter_date >= DATE_SUB(CURDATE(), INTERVAL 60 DAY)
    AND l.approved_by IS NOT NULL 
    AND l.approved_date IS NOT NULL;  
  `, (err, res) => {


    if (err) {
      result({ error: true, data: "Something Went Wrong" });
    } else {
      result({ error: false, data: res });
    }
  });
};


reports.getAttendanceHistory = (req, result) => {
  const emp_id = req.body.enterBy;
  const enter_date = req.body.enter_date; // Use the new 'enter_date' parameter

  const query = `
    SELECT 
      emp_id,  
      -- Use CONVERT_TZ to convert time to Asia/Kolkata timezone
      TIME_FORMAT(CONVERT_TZ(punch_in, '+00:00', 'Asia/Kolkata'), '%h:%i %p') AS punch_in, 
      in_address, 
      -- If punch_out is null, show 'NULL' instead of default 00:00
      COALESCE(TIME_FORMAT(CONVERT_TZ(punch_out, '+00:00', 'Asia/Kolkata'), '%h:%i %p'), 'NULL') AS punch_out, 
      out_address
    FROM crm_dev_db.cor_attendance_m
    WHERE emp_id = ? 
    AND DATE(punch_date) = ?;
  `;

  // Execute the query with parameterized values
  sql.query(query, [emp_id, enter_date], (err, res) => {
    if (err) {
      console.error("Query Error:", err);
      return result({ error: true, data: "Something Went Wrong" });
    }

    // Return the fetched data
    return result({ error: false, data: res });
  });
};






// reports.Leaveidapproval = (req, result) => {

//   const { leaveIds, empidd } = req.body;
//   console.log(leaveIds,"testS");



//   const query = `
//     UPDATE crm_dev_db.cor_leave_m 
//     SET approved_by = ?, approved_date = NOW() 
//     WHERE id IN (${leaveIds.map(() => "?").join(", ")})
//   `;

//   sql.query(query, [empidd, ...leaveIds], (err, res) => {
//     if (err) {
//       console.error("Approval Error:", err);
//       return result({ error: true, message: "Something went wrong" });
//     }

//     return result({ error: false, message: "Leaves approved successfully", data: res });
//   });
// };

reports.Leaveidapproval = (req, result) => {
  const { leaveIds, empidd } = req.body;

  const placeholders = leaveIds.map(() => "?").join(", ");
  const updateLeaveQuery = `
    UPDATE crm_dev_db.cor_leave_m 
    SET approved_by = ?, approved_date = NOW(), status = 2
    WHERE id IN (${placeholders})
  `;

  sql.query(updateLeaveQuery, [empidd, ...leaveIds], (err, updateRes) => {
    if (err) {
      console.error("Approval Error:", err);
      return result({ error: true, message: "Something went wrong while approving leave" });
    }

    const fetchLeaveQuery = `
      SELECT 
        id, emp_id, start_date, end_date, leave_type, status AS leave_status
      FROM crm_dev_db.cor_leave_m 
      WHERE id IN (${placeholders})
    `;

    sql.query(fetchLeaveQuery, [...leaveIds], (err, leaveRows) => {
      if (err) {
        console.error("Leave Fetch Error:", err);
        return result({ error: true, message: "Something went wrong while fetching leave details" });
      }

      const insertRows = [];

      leaveRows.forEach(row => {
        let start = new Date(row.start_date);
        const end = new Date(row.end_date || row.start_date);

        while (start <= end) {
          const punchDate = start.toISOString().split("T")[0];

          insertRows.push(`
            (crm_dev_db.all_auto_no(55), ${row.emp_id}, '${punchDate}', 'D', 1, NOW(), '${row.leave_status}', '${row.leave_type}', '${row.leave_status}', 'N')
          `);

          start = new Date(start.getTime() + 24 * 60 * 60 * 1000); // Next day
        }
      });

      if (insertRows.length === 0) {
        return result({
          error: false,
          message: "Leave approved, but no valid attendance dates found."
        });
      }

      const finalInsertQuery = `
        INSERT INTO crm_dev_db.cor_attendance_m 
        (attendance_id, emp_id, punch_date, shift, enter_by, enter_date, status, leave_type, leave_status, eod)
        VALUES ${insertRows.join(",\n")}
      `;

      sql.query(finalInsertQuery, (err, insertRes) => {
        if (err) {
          console.error("Attendance Insert Error:", err);
          return result({ error: true, message: "Leave approved but failed to insert attendance" });
        }

        return result({
          error: false,
          message: "Leave approved and attendance inserted successfully",
          attendance_inserted: insertRes.affectedRows,
          data: updateRes
        });
      });
    });
  });
};







reports.LeaveidRejection = (req, result) => {
  const { leaveIds, empidd } = req.body;

  const query = `
    UPDATE crm_dev_db.cor_leave_m 
    SET approved_by = ?, approved_date = NOW(), status = 3 
    WHERE id IN (${leaveIds.map(() => "?").join(", ")})
  `;

  sql.query(query, [empidd, ...leaveIds], (err, res) => {
    if (err) {
      console.error("Rejection Error:", err);
      return result({ error: true, message: "Something went wrong" });
    }

    return result({ error: false, message: "Leaves rejected successfully", data: res });
  });
};




reports.Leaverejectedlist = (req, result) => {
  console.log("Leave Rejected List is hitting");

  sql.query(`
    SELECT 
      l.*, 
      l.leave_reason,
      e.user_name  
    FROM 
      crm_dev_db.cor_leave_m l
    JOIN 
      crm_dev_db.cor_emp_m e 
      ON l.emp_id = e.emp_id 
    WHERE 
      l.reporting_to = '${req.body.empidd}' 
      AND l.enter_date >= DATE_SUB(CURDATE(), INTERVAL 60 DAY)
      AND l.status = 3;  -- Status = 3 for rejected leaves
  `, (err, res) => {


    if (err) {
      result({ error: true, data: "Something Went Wrong" });
    } else {
      result({ error: false, data: res });
    }
  });
};


reports.Leavestatuslist = (req, result) => {
  const empId = req.body.empidd;
  const year = req.body.year; // ✅ Year ko request se le rahe hain

  let yearCondition = "";
  if (year) {
    // ✅ Agar specific year diya hai toh usi ka data fetch hoga
    yearCondition = `AND YEAR(l.enter_date) = ${year}`;
  } else {
    // ✅ Agar year nahi diya toh pichle 2 saal ka data aayega
    yearCondition = `AND YEAR(l.enter_date) IN (YEAR(CURDATE()), YEAR(CURDATE()) - 1)`;
  }

  sql.query(`
    SELECT 
        l.*, 
        l.leave_reason,
        e.user_name, 
        e.emp_code, 
        CASE 
            WHEN l.status = 3 THEN 'R'  -- Pehle rejected check karo
            WHEN l.approved_by IS NOT NULL AND l.approved_date IS NOT NULL THEN 'A'
            WHEN l.approved_by IS NULL AND l.approved_date IS NULL THEN 'P'
            ELSE 'Unknown'
        END AS leave_status
    FROM 
        crm_dev_db.cor_leave_m l
    JOIN 
        crm_dev_db.cor_emp_m e 
        ON l.emp_id = e.emp_id 
    WHERE 
        l.emp_id = '${empId}'
        ${yearCondition}  -- ✅ Dynamic year condition
    ORDER BY 
        l.enter_date DESC;
  `, (err, res) => {


    if (err) {
      result({ error: true, data: "Something Went Wrong" });
    } else {
      result({ error: false, data: res });
    }
  });
};


reports.getPendingLeaveCount = (req, result) => {
  const empId = req.body.empidd; // Reporting manager ka emp_id

  const query = `
    SELECT 
  COUNT(DISTINCT l.id) AS pending_count
FROM 
  crm_dev_db.cor_leave_m l
JOIN 
  crm_dev_db.cor_emp_m e 
  ON l.emp_id = e.emp_id 
WHERE 
  l.reporting_to = ?
  AND l.status = 1;
  `;

  sql.query(query, [empId], (err, res) => {
    if (err) {
      console.error("Error fetching pending regularization count:", err);
      return result({ error: true, data: "Something went wrong" });
    }

    result({ error: false, data: res[0] });
  });
};



////button click

// show punch in puch out send date
reports.EODAttendancebutton = (req, result) => {
  sql.query(`SELECT punch_in , punch_out FROM crm_dev_db.cor_attendance_m where punch_date = '${req.body.enterDate}' and emp_id='${req.body.enterBy}'`, console.log(`SELECT punch_in , punch_out FROM crm_dev_db.cor_attendance_m where punch_date = '${req.body.enterDate}' and emp_id='${req.body.enterBy}'`), (err, res) => {
    console.log("osbss: ", res);
    if (err) {
      result({ error: true, data: "Something Went Wrong" })
    }
    result({ error: false, data: res })
  });
};

reports.EodNotPunchIn = (req, result) => {
  sql.query(`SELECT punch_date,punch_in,eod,emp_id,attendance_id FROM crm_dev_db.cor_attendance_m where eod = "N" and holiday_status = -1 and leave_status = -1 and status = 1 and emp_id='${req.body.enterBy}' and punch_date  BETWEEN ADDDATE(CURDATE(), -30) AND CURDATE()-1`, (err, res) => {
    console.log("osbss: ", res);
    if (err) {
      result({ error: true, data: "Something Went Wrong" })
    }
    result({ error: false, data: res })
  });
};


reports.EodShareUpdate = (req, result) => {
  console.log(req.body.punchdate, 'pojhhdhed');
  console.log(req.body.enterBy, 'huyhfur');

  sql.query(`UPDATE crm_dev_db.cor_attendance_m
    SET eod = "Y"
    WHERE punch_date= '${req.body.punchdate}' and emp_id = '${req.body.enterBy}'`, (err, res) => {
    console.log("osbss: ", res);
    if (err) {
      result({ error: true, data: "Something Went Wrong" })
    }
    result({ error: false, data: res })
  });
};

// reports.skuorderwise =  (req, result) => {

//   sql.query(`select d.order_id,d.item_id ,sku.sku_name , d.item_qty , d.order_amt  from 
//   crm_dev_db.cor_order_d d , crm_dev_db.cor_sku_m sku  where d.item_id in ${(req.body.skuids)}' and sku.sku_id = d.item_id and d.enter_by='${req.body.enterBy}'`,
//   console.log(`select d.order_id,d.item_id ,sku.sku_name , d.item_qty , d.order_amt  from 
//   crm_dev_db.cor_order_d d , crm_dev_db.cor_sku_m sku  where d.item_id in (${req.body.skuids})and sku.sku_id = d.item_id and d.enter_by='${req.body.enterBy}'`), (err, res) => {
//     console.log("osbss: ", res);
//     if (err) {
//       result({ error: true, data: "Something Went Wrong" })
//     }
//     result({ error: false, data: res })
//   });


// };


reports.skuorderwise = (req, result) => {
  sql.query(`select d.order_id,d.item_id ,sku.sku_name , d.item_qty , d.order_amt  from crm_dev_db.cor_order_d d , crm_dev_db.cor_sku_m sku  where d.item_id in (${req.body.skuids}) and sku.sku_id = d.item_id and d.enter_by='${req.body.enterBy}'`, console.log(`select d.order_id,d.item_id ,sku.sku_name , d.item_qty , d.order_amt  from crm_dev_db.cor_order_d d , crm_dev_db.cor_sku_m sku  where d.item_id in ${(req.body.skuids)} and sku.sku_id = d.item_id and d.enter_by='${req.body.enterBy}'`), (err, res) => {
    console.log("osbss: ", res);
    if (err) {
      result({ error: true, data: "Something Went Wrong" })
    }
    result({ error: false, data: res })
  });
};

reports.Totalskuorderwise = (req, result) => {
  console.log('hguhufhv', req.body);




  // Construct the SQL query with placeholders for skuids
  const skuids = req.body.skuids.map(() => "?").join(", ");
  const fromDate = req.body.fromdate;
  const toDate = req.body.todate;
  const enterBy = req.body.enterBy;

  // SQL query
  const query = `
    SELECT d.item_id, sku.sku_name, SUM(d.item_qty) AS TotalQTY, SUM(d.order_amt) AS TotalAMT
    FROM crm_dev_db.cor_order_d d
    JOIN crm_dev_db.cor_sku_m sku ON sku.sku_id = d.item_id
    WHERE d.item_id IN (${skuids})
      AND DATE(d.enter_date) BETWEEN ? AND ?
      AND d.enter_by = ?
    GROUP BY d.item_id, sku.sku_name;
  `;

  // Execute the query
  sql.query(query, [...req.body.skuids, fromDate, toDate, enterBy], (err, res) => {
    if (err) {
      console.error("Error executing query:", err);
      return result({ error: true, data: "Something Went Wrong" });
    }

    // Return the results
    result({ error: false, data: res });
  });
};



///reguralize 



reports.attendance_regulization = (req, result) => {
  const emp_id = req.body.emp_id;
  const requestDate = req.body.requestDate;
  const requestRemarks = req.body.Request_Remarks;

  // Step 1: Fetch attendance data for the given request date
  sql.query(
    `
    SELECT e.emp_id, e.reporting_to, a.punch_in, a.punch_out, a.punch_date
    FROM crm_dev_db.cor_emp_m e
    LEFT JOIN crm_dev_db.cor_attendance_m a 
      ON e.emp_id = a.emp_id 
      AND a.punch_date = '${requestDate}'  
    WHERE e.emp_id = '${emp_id}'
    `,
    (err, res) => {
      if (err || res.length === 0) {
        console.error("Error fetching employee details:", err);
        return result({ error: true, data: "Attendance record not found for this date" });
      }

      const { reporting_to, punch_in, punch_out } = res[0];

      const formatDate = (date) =>
        date ? new Date(date).toISOString().slice(0, 19).replace("T", " ") : null;

      const formattedPunchIn = punch_in ? formatDate(punch_in) : null;
      const formattedPunchOut = punch_out ? formatDate(punch_out) : null;

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      sql.query(
        `
        SELECT COUNT(*) AS r_counter
        FROM crm_dev_db.cor_regulization_m
        WHERE enter_by = '${emp_id}' 
          AND YEAR(Request_date) = ${currentYear}
          AND MONTH(Request_date) = ${currentMonth}
          AND status = 'P'
        `,
        (err, res) => {
          if (err || res.length === 0) {
            console.error("Error fetching regularization count:", err);
            return result({ error: true, data: "Error fetching regularization count" });
          }

          const { r_counter } = res[0];

          if (r_counter >= 3) {
            return result({
              error: true,
              data: "You have exceeded the regularization limit (3 times) for this month",
            });
          }

          // Step 5: Check if record already exists for this emp_id and requestDate
          sql.query(
            `
            SELECT COUNT(*) AS existing_count
            FROM crm_dev_db.cor_regulization_m
            WHERE enter_by = '${emp_id}' 
              AND Request_date = '${requestDate}'
            `,
            (err, res) => {
              if (err || res.length === 0) {
                console.error("Error checking existing regularization:", err);
                return result({ error: true, data: "Error checking existing regularization" });
              }

              const { existing_count } = res[0];

              // If the record already exists, return an error message
              if (existing_count > 0) {
                return result({
                  error: true,
                  data: "Regularization for this date already exists",
                });
              }

              // Step 6: Convert punch_in and punch_out to IST if present
              const convertToIST = (date) => {
                return date
                  ? `CONVERT_TZ('${date}', '+00:00', '+05:30')`  // Convert UTC to IST
                  : "NULL";
              };

              // Step 7: Insert into `cor_regulization_m` with null handling
              sql.query(
                `
                INSERT INTO crm_dev_db.cor_regulization_m (
                  Reporting_to, Request_date, enter_by, punch_in, punch_out, 
                  Request_Remarks, enter_date, status
                ) VALUES (
                  '${reporting_to}', '${requestDate}', '${emp_id}', 
                  ${convertToIST(formattedPunchIn)},
                  ${convertToIST(formattedPunchOut)},
                  '${requestRemarks}', SYSDATE(), 'P'
                )
                `,
                (insertErr) => {
                  if (insertErr) {
                    console.error("Insert Error: ", insertErr);
                    return result({ error: true, data: "Something Went Wrong" });
                  }

                  result({ error: false, data: "Successfully Submitted" });
                }
              );
            }
          );
        }
      );
    }
  );
};


reports.getPendingRegularizations = (req, result) => {
  const empId = req.body.empidd; // Reporting manager ka emp_id

  const query = `
    SELECT 
      r.enter_by, 
      TIME_FORMAT(CONVERT_TZ(r.punch_in, '+00:00', 'Asia/Kolkata'), '%h:%i %p') AS punch_in, 
  TIME_FORMAT(CONVERT_TZ(r.punch_out, '+00:00', 'Asia/Kolkata'), '%h:%i %p') AS punch_out,  
      r.Request_Remarks, 
      r.Request_date, 
      r.enter_date, 
      r.status,
      r.Regular_id, 
      e.user_name  
    FROM 
      crm_dev_db.cor_regulization_m r
    JOIN 
      crm_dev_db.cor_emp_m e 
      ON r.enter_by = e.emp_id 
    WHERE 
      r.Reporting_to = ? 
      AND r.status = 'P'
  `;

  sql.query(query, [empId], (err, res) => {
    if (err) {
      console.error("Error fetching pending regularizations:", err);
      return result({ error: true, data: "Something went wrong" });
    }

    result({ error: false, data: res });
  });
};



// reports.Regulizationidapproval = (req, result) => {
//   const { regulizationIds, empidd } = req.body;



//   const query = `
//     UPDATE crm_dev_db.cor_regulization_m 
//     SET Approved_ID = ?, Approved_date = NOW(), status = 'A'
//     WHERE Regular_id IN (${regulizationIds.map(() => "?").join(", ")}) 
//     AND status = 'P'
//   `;

//   sql.query(query, [empidd, ...regulizationIds], (err, res) => {
//     if (err) {
//       console.error("Approval Error:", err);
//       return result({ error: true, message: "Something went wrong" });
//     }

//     return result({ error: false, message: "Regularizations approved successfully", data: res });
//   });
// };



reports.Regulizationidapproval = (req, result) => {
  const { regulizationIds, manager_empid, team_empid } = req.body;

  const updateQuery = `
    UPDATE crm_dev_db.cor_regulization_m 
    SET Approved_ID = ?, Approved_date = NOW(), status = 'A'
    WHERE Regular_id IN (${regulizationIds.map(() => "?").join(", ")}) 
    AND status = 'P'
  `;

  sql.query(updateQuery, [manager_empid, ...regulizationIds], (err, res) => {
    if (err) {
      console.error("Approval Error:", err);
      return result({ error: true, message: "Something went wrong" });
    }

    // Fetch requested dates for the given regulizationIds
    const fetchDatesQuery = `
      SELECT Regular_id, Request_date as Requested_date,enter_by
      FROM crm_dev_db.cor_regulization_m 
      WHERE Regular_id IN (${regulizationIds.map(() => "?").join(", ")})
    `;

    console.log(fetchDatesQuery, "Line 1338")

    sql.query(fetchDatesQuery, [...regulizationIds], (err, dateResults) => {
      if (err) {
        console.error("Fetch Requested Dates Error:", err);
        return result({ error: true, message: "Failed to fetch requested dates" });
      }

      // Get shift start and end times
      const shiftQuery = `SELECT start_time, end_time FROM crm_dev_db.cor_shift_m LIMIT 1`;
      sql.query(shiftQuery, (err, shiftRes) => {
        if (err || shiftRes.length === 0) {
          console.error("Shift Time Fetch Error:", err);
          return result({ error: true, message: "Failed to fetch shift times" });
        }

        const { start_time, end_time } = shiftRes[0];
        console.log(dateResults, "line 1343");

        // Process each requested date
        const updates = dateResults.map(({ Regular_id, Requested_date, enter_by }) => {
          return new Promise((resolve, reject) => {
            const checkAttendanceQuery = `
              SELECT attendance_id FROM crm_dev_db.cor_attendance_m 
WHERE emp_id = ? AND punch_date = ? AND punch_out IS NULL
            `;
            console.log(team_empid, Requested_date, "Line 1352");

            sql.query(checkAttendanceQuery, [team_empid, Requested_date], (err, attendanceRes) => {
              if (err) {
                console.error("Check Attendance Error:", err);
                return reject(err);
              }


              if (attendanceRes.length > 0) {
                // Update existing record
                const updateAttendanceQuery = `
                  UPDATE crm_dev_db.cor_attendance_m 
  SET 
  punch_in = CONCAT(DATE(?), ' ', TIME(?)),
    punch_out = CONCAT(DATE(?), ' ', TIME(?)) 
  WHERE emp_id = ? and punch_date = ? 
`;
                // console.log(Requested_date, start_time,  empidd, Requested_date, "Line 1365");

                sql.query(updateAttendanceQuery,
                  [Requested_date, start_time,Requested_date, end_time, team_empid, Requested_date]
                  ,
                  (err, updateRes) => {
                    if (err) {
                      console.error("Update Attendance Error:", err);
                      return reject(err);
                    }
                    resolve({ Regular_id, Requested_date, action: "Updated" });
                  });
              } else {
                // Insert new record
                const insertAttendanceQuery = `
                  INSERT INTO 
                      crm_dev_db.cor_attendance_m 
                (attendance_id,
                 emp_id, 
                 shift,
                  punch_date,
                  punch_in,
                  punch_out, 
                  enter_by, 
                  enter_date, 
                  in_address, 
                  out_address,
                  eod
                  ) 
                VALUES (
                  (SELECT crm_dev_db.all_auto_no(55)),
                   ?,
                    'D',
                     ?, 
                  CONCAT(DATE(?), ' ', TIME(?)), 
                  CONCAT(DATE(?), ' ', TIME(?)), 
                  ?,
                   NOW(), 
                   'regularization', 'regularization','Y'
  )
`;


                sql.query(insertAttendanceQuery, [team_empid, Requested_date, Requested_date, start_time, Requested_date, end_time, manager_empid], (err, insertRes) => {
                  if (err) {
                    console.error("Insert Attendance Error:", err);
                    return reject(err);
                  }
                  resolve({ Regular_id, Requested_date, action: "Inserted" });
                });
              }
            });
          });
        });

        // Execute all updates and return response
        Promise.all(updates)
          .then((attendanceUpdates) => {
            return result({
              error: false,
              message: "Regularizations approved and attendance updated successfully",
              data: attendanceUpdates,
            });
          })
          .catch((error) => {
            console.error("Attendance Processing Error:", error);
            return result({ error: true, message: "Error updating attendance" });
          });
      });
    });
  });
};



reports.Regulizationidrejected = (req, result) => {
  const { regulizationIds, empidd } = req.body;



  const query = `
    UPDATE crm_dev_db.cor_regulization_m 
    SET Approved_ID = ?, Approved_date = NOW(), status = 'R'
    WHERE Regular_id IN (${regulizationIds.map(() => "?").join(", ")}) 
    AND status = 'P'
  `;

  sql.query(query, [empidd, ...regulizationIds], (err, res) => {
    if (err) {
      console.error("Approval Error:", err);
      return result({ error: true, message: "Something went wrong" });
    }

    return result({ error: false, message: "Regularizations rejected successfully", data: res });
  });
};


reports.RejectedRegularizationList = (req, result) => {
  console.log("Rejected Regularization List is hitting");

  sql.query(`
    SELECT 
      r.Request_date,
      r.enter_by,
      e.user_name,
      r.punch_in,
      r.punch_out,
      r.Request_Remarks,
      r.enter_date,
      r.approved_date
    FROM 
      crm_dev_db.cor_regulization_m r
    JOIN 
      crm_dev_db.cor_emp_m e 
      ON r.enter_by = e.emp_id  -- Joining to get user_name
    WHERE 
      r.reporting_to = '${req.body.empidd}' 
      AND r.status = 'R';  -- Status 'R' for rejected regularizations
  `, (err, res) => {

    if (err) {
      result({ error: true, data: "Something Went Wrong" });
    } else {
      result({ error: false, data: res });
    }
  });
};

reports.ApprovedRegularizationList = (req, result) => {
  // console.log("Rejected Regularization List is hitting");

  sql.query(`
    SELECT 
      r.Request_date,
      r.enter_by,
      e.user_name,
      r.punch_in,
      r.punch_out,
      r.Request_Remarks,
      r.enter_date,
      r.approved_date
    FROM 
      crm_dev_db.cor_regulization_m r
    JOIN 
      crm_dev_db.cor_emp_m e 
      ON r.enter_by = e.emp_id  -- Joining to get user_name
    WHERE 
      r.reporting_to = '${req.body.empidd}' 
      AND r.status = 'A';  -- Status 'R' for rejected regularizations
  `, (err, res) => {

    if (err) {
      result({ error: true, data: "Something Went Wrong" });
    } else {
      result({ error: false, data: res });
    }
  });
};

reports.getPendingRegularizationCount = (req, result) => {
  const empId = req.body.empidd; // Reporting manager ka emp_id

  const query = `
    SELECT 
      COUNT(*) AS pending_count
    FROM 
      crm_dev_db.cor_regulization_m r
    JOIN 
      crm_dev_db.cor_emp_m e 
      ON r.enter_by = e.emp_id 
    WHERE 
      r.Reporting_to = ? 
      AND r.status = 'P'
  `;

  sql.query(query, [empId], (err, res) => {
    if (err) {
      console.error("Error fetching pending regularization count:", err);
      return result({ error: true, data: "Something went wrong" });
    }

    result({ error: false, data: res[0] });
  });
};





module.exports = reports;