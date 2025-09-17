const sql = require("../db.js");
const moment = require('moment-timezone');

// constructor
const outlet = function (osbs) {
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


////Retail

// outlet.DatewiseOutlet = (req, result) => {
//   sql.query(`select outlet_date from crm_dev_db.cor_mtp_a where user_id ='${req.body.empid}' and outlet_date>=curdate() order by outlet_date asc;`,
//     (err, res) => {
//       console.log("osbss: ", res);
//       if (err) {
//         result({ error: true, data: "Something Went Wrong" })
//       }
//       result({ error: false, data: res })
//     });
// };

outlet.dateWiseOutlet = (req, result) => {
  console.log("i am here");
  let selectedDate = '02-12-2024';
  console.log(moment(selectedDate, 'DD-MM-YYYY').format('YYYY-DD-MM'));


  console.log(req.body.empid);

  sql.query(`SELECT DISTINCT outlet_date
FROM crm_dev_db.cor_mtp_a
WHERE user_id = '${req.body.empid}' 
  AND outlet_date >= CURRENT_DATE()
ORDER BY outlet_date ASC;`,
    (err, res) => {
      console.log("osbss: ", res);
      if (err) {
        result({ error: true, data: "Something Went Wrong" })
      }
      result({ error: false, data: res })
    });
};

// outlet.DatewiseOutlet_data = (req, result) => {
//   sql.query(`SELECT m.outlet_date,m.user_id,o.outlet_id,o.outlet_name,o.phone_number,c.customer_type_name,co.outlet_category_name,emp.division,emp.zone_id,o.dealer_id,o.beat_id FROM romsondb.cor_mtp_a AS m
//   LEFT JOIN romsondb.cor_outlet_m AS o ON  m.beat_id = o.beat_id
//   LEFT JOIN romsondb.cor_customer_type_m AS c ON o.customer_type_id = c.customer_type_id
//   LEFT JOIN romsondb.cor_outlet_category_m AS co ON o.outlet_category_id = co.outlet_category_id
//   LEFT JOIN romsondb.cor_emp_m AS emp ON emp.emp_id = m.user_id
//     where m.user_id = '${req.body.empid}' and m.outlet_date= '${req.body.outletdate}' ORDER BY o.outlet_name`,
//     (err, res) => {
//       console.log("osbss: ", res);
//       if (err) {
//         result({ error: true, data: "Something Went Wrong" })
//       }
//       result({ error: false, data: res })
//     });
// };

outlet.DatewiseOutlet_data = (req, result) => {
  let outletDate = req.body.outletDate;
  if (!outletDate) {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0]; // Format date as 'YYYY-MM-DD'
    outletDate = formattedDate; // Use current date if outletdate is not provided
  }
console.log(outletDate,'poojaaa');

  sql.query(
    `
   SELECT 
    m.outlet_date, 
    m.user_id, 
    o.outlet_id, 
    o.outlet_name, 
    o.phone_number, 
    -- Mapping outlet_category_id to customer_type_name using CASE
    CASE 
        WHEN o.outlet_category_id = 1 THEN 'Bronze'
        WHEN o.outlet_category_id = 3 THEN 'Sub-Dealer'
        WHEN o.outlet_category_id = 2 THEN 'Silver'
        WHEN o.outlet_category_id = 4 THEN 'Stockist'
        WHEN o.outlet_category_id = 5 THEN 'Gold'
        ELSE 'Unknown'
    END AS customer_type_name, 
    co.outlet_category_name, 
    emp.division, 
    emp.zone_id, 
    o.dealer_id, 
    o.beat_id,
    -- Determine icon color based on outlet_lat and outlet_long values
    CASE 
        WHEN (o.outlet_lat IS NULL OR o.outlet_lat = '' OR o.outlet_lat = ' ' OR o.outlet_lat = 0 
              OR o.outlet_long IS NULL OR o.outlet_long = '' OR o.outlet_long = ' ' OR o.outlet_long = 0) 
        THEN 'Red'
        ELSE NULL 
    END AS icon_color,
    -- Check if an order exists for the outlet_id on the given date
    CASE 
        WHEN COUNT(ord.outlet_id) > 0 THEN 'Red' 
        ELSE NULL 
    END AS order_status,
    -- Check if an activity exists for the outlet_id on the given date
    CASE 
        WHEN COUNT(act.outlet_id) > 0 THEN 'Blue' 
        ELSE NULL 
    END AS activity_status
FROM 
    romsondb.cor_mtp_a AS m
LEFT JOIN 
    romsondb.cor_outlet_m AS o ON m.beat_id = o.beat_id
LEFT JOIN 
    romsondb.cor_outlet_category_m AS co ON o.outlet_category_id = co.outlet_category_id
LEFT JOIN 
    romsondb.cor_emp_m AS emp ON emp.emp_id = m.user_id
LEFT JOIN 
    romsondb.cor_order_m AS ord ON ord.outlet_id = o.outlet_id AND ord.order_date = m.outlet_date
LEFT JOIN 
    romsondb.cor_outlet_activity_m AS act ON act.outlet_id = o.outlet_id AND act.activity_date = m.outlet_date
WHERE 
    m.user_id =  '${req.body.empid}' 
    AND m.outlet_date = '${outletDate}' 
    AND o.status = "A"
GROUP BY 
    m.outlet_date, m.user_id, o.outlet_id
ORDER BY 
    o.outlet_name;
    `,
    (err, res) => {
      // console.log("Query Result: ", res);
      if (err) {
        return result({ error: true, data: "Something Went Wrong" });
      }
      result({ error: false, data: res });
    }
  );
};



outlet.jioAddress = (req, result) => {
  const { outlet_id, jio_address,outlet_lat,outlet_long } = req.body; 
  
  sql.query(`
    SELECT outlet_id FROM crm_dev_db.cor_outlet_m WHERE outlet_id = "${outlet_id}"`, 
    (err, res) => {
      if (err) {
        result({ error: true, data: "Something Went Wrong" });
      } else if (res.length === 0) {
        result({ error: true, data: "Outlet ID not found" });
      } else {
        
        sql.query(`
          UPDATE crm_dev_db.cor_outlet_m
          SET jio_address = "${jio_address}", outlet_lat = "${outlet_lat}", outlet_long = "${outlet_long}"
          WHERE outlet_id = "${outlet_id}"`, 
          (err, updateRes) => {
            if (err) {
              result({ error: true, data: "Failed to update address" });
            } else {
              result({ error: false, data: "Address updated successfully" });
            }
          });
      }
    });
};



// Function to fetch the address based on outlet_id
outlet.getAddress = (req, result) => {
  const { outlet_id } = req.query; // Retrieve outlet_id from query params

  // Check if outlet_id is provided
  if (!outlet_id) {
    result({ error: true, data: 'Outlet ID is required' });
    return;
  }

  // Query to fetch the jio_address for the provided outlet_id
  const query = 'SELECT jio_address FROM crm_dev_db.cor_outlet_m WHERE outlet_id = ?';

  // Execute the query
  sql.query(query, [outlet_id], (err, res) => {
    if (err) {
      console.error('Error fetching address:', err);
      result({ error: true, data: 'Database error' });
    } else if (res.length > 0) {
      // Return the address if found
      result({ error: false, data: res[0].jio_address });
    } else {
      // Return an error if no address is found for the given outlet_id
      result({ error: true, data: 'Address not found for this outlet_id' });
    }
  });
};




outlet.Reporting_hierarchy = (req, result) => {
  const { empid } = req.body;  // Extracting empid from request body

  // SQL Query
  const sqlQuery = `
    WITH RECURSIVE reporting_hierarchy AS (
    -- Base case: Start with the given emp_id
    SELECT 
        emp_id,
        reporting_to,
        user_name AS user_name,  -- Using 'user_name' instead of 'emp_name'
        NULL AS reporting_name,
        1 AS level  -- Adding level to limit recursion
    FROM 
        crm_dev_db.cor_emp_m
    WHERE 
        emp_id = ?
        AND reporting_to != 0  -- Exclude cases where reporting_to is 0
    
    UNION ALL
    
    -- Recursive case: Fetch details of reporting_to with a limit on levels
    SELECT 
        c.emp_id,
        c.reporting_to,
        c.user_name,
        r.user_name AS reporting_name,
        r.level + 1 AS level  -- Increment the recursion level
    FROM 
        crm_dev_db.cor_emp_m c
    INNER JOIN 
        reporting_hierarchy r
    ON 
        c.emp_id = r.reporting_to
    WHERE
        r.level < 7  -- Limit the recursion to 8 levels
        AND c.reporting_to != 0  -- Exclude cases where reporting_to is 0
)
SELECT 
    r1.emp_id,
    r1.reporting_to,
    r2.user_name AS reporting_to_name  -- Get the 'user_name' of the person being reported to
FROM 
    reporting_hierarchy r1
LEFT JOIN 
    romsondb.cor_emp_m r2
ON 
    r1.reporting_to = r2.emp_id
WHERE 
    r1.reporting_to IS NOT NULL;  -- Ensure reporting_to is not NULL

;

  `;

  // Execute the query with the empid parameter from the body
  sql.query(sqlQuery, [empid], (err, res) => {
    if (err) {
      // Log the error for debugging and return the error response
      console.log("Error executing query:", err);
      return result({ error: true, data: "Something Went Wrong" });
    }

    // Return the result from the query
    result({ error: false, data: res });
  });
};



outlet.Dealernamelist = (req, result) => {
  sql.query(`
    SELECT 
    emp.emp_id,
     emp.state_id,
     dealer.dealer_id, 
    dealer.dealer_name 
FROM 
    crm_dev_db.cor_emp_m AS emp
JOIN 
    crm_dev_db.cor_dealer_m AS dealer 
ON 
    emp.state_id = dealer.state_id  
WHERE 
    emp.emp_id = '${req.body.empidd}';  
  `, (err, res) => {
    
    console.log("Result Data: ", res);

    if (err) {
      result({ error: true, data: "Something Went Wrong" });
    } else {
      result({ error: false, data: res });
    }
  });
};



// outlet.countOutlet = (req, result) => {
//   sql.query(`SELECT COUNT(*) as Totaloutlet,bm.beat_name FROM romsondb.cor_mtp_a AS m
//     LEFT JOIN romsondb.cor_outlet_m AS o ON  m.beat_id = o.beat_id
//     LEFT JOIN romsondb.cor_customer_type_m AS c ON o.customer_type_id = c.customer_type_id
//     LEFT JOIN romsondb.cor_outlet_category_m AS co ON o.outlet_category_id = co.outlet_category_id
//     LEFT Join romsondb.cor_beat_m as bm on o.beat_id = bm.beat_id
//     where m.user_id = '${req.body.empid}' and m.outlet_date= '${req.body.outletdate}'`,
//     (err, res) => {
//       console.log("osbss: ", res);
//       if (err) {
//         result({ error: true, data: "Something Went Wrong" })
//       }
//       result(res)
//     });
// };


/////i>outletView


outlet.countOutlet = (req, result) => {
  let outletDate = req.body.outletDate;
  if (!outletDate) {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0]; // Format date as 'YYYY-MM-DD'
    outletDate = formattedDate; // Use current date if outletdate is not provided
  }

  sql.query(`SELECT 
    COUNT(*) AS Totaloutlet, 
    bm.beat_name, 
    m.min_outlet_coverage
FROM romsondb.cor_mtp_a AS m
LEFT JOIN romsondb.cor_outlet_m AS o ON m.beat_id = o.beat_id
LEFT JOIN romsondb.cor_customer_type_m AS c ON o.customer_type_id = c.customer_type_id
LEFT JOIN romsondb.cor_outlet_category_m AS co ON o.outlet_category_id = co.outlet_category_id
LEFT JOIN romsondb.cor_beat_m AS bm ON o.beat_id = bm.beat_id
WHERE m.user_id =  '${req.body.empid}' 
  AND m.outlet_date = '${outletDate}' 
  AND o.status = "A"
GROUP BY bm.beat_name, m.min_outlet_coverage;`,
    (err, res) => {
      console.log("osbss: ", res);
      if (err) {
        result({ error: true, data: "Something Went Wrong" });
      }
      result(res);
    });
};


outlet.SelectedOutlet = (req, result) => {
  sql.query(`SELECT 
  o.id,
  o.outlet_id,
  o.beat_id,
  o.outlet_name,
  o.address,
  o.phone_number,
  o.owner_name,
  o.email,
  o.pin,
  o.type,
  o.total_bed,
  o.icu_bed,
  o.ot_bed,
  o.dealer_id,
  o.jio_address,
  b.zone_id,
  b.division_id,
  c.outlet_category_name
  FROM crm_dev_db.cor_outlet_m o
LEFT JOIN crm_dev_db.cor_beat_m b
  ON o.beat_id = b.beat_id
LEFT JOIN crm_dev_db.cor_outlet_category_m c
  ON o.outlet_category_id = c.outlet_category_id  -- Corrected join condition
WHERE o.outlet_id = '${req.body.outletID}'`,
    (err, res) => {
      console.log("osbss: ", res);
      if (err) {
        result({ error: true, data: "Something Went Wrong" })
      }
      result({ data: res })
    });
};

////ii>updateinfo

outlet.udateinfo = (req, result) => {
  sql.query(`UPDATE romsondb.cor_outlet_m SET email = '${req.body.email}', 
    phone_number = '${req.body.phoneNO}',address = '${req.body.address}'
     WHERE outlet_id='${req.body.outletID}'`,
    (err, res) => {
      console.log("osbss: ", res);
      if (err) {
        result({ error: true, data: "Something Went Wrong" })
      }
      result({ error: false, data: res })
    });
};

outlet.udatehospitalinfo = (req, result) => {
  sql.query(`UPDATE romsondb.cor_outlet_m SET email = '${req.body.email}', 
    phone_number = '${req.body.phoneNO}',address = '${req.body.address}',
    icu_bed = '${req.body.icubed}',ot_bed = '${req.body.otbed}',total_bed = '${req.body.totalbed}'
     WHERE outlet_id='${req.body.outletID}'`,
    (err, res) => {
      console.log("osbss: ", res);
      if (err) {
        result({ error: true, data: "Something Went Wrong" })
      }
      result({ error: false, data: res })
    });
};

//   iii>Activityretail

outlet.retail_activity = async (req, result) => {

  sql.query(`INSERT INTO crm_dev_db.cor_outlet_activity_m (id,outlet_id, remark, enter_by,enter_date,activity_date,zone_id,division_m,act_lat,act_long,hospital_name)
    VALUES ((select crm_dev_db.all_auto_no(66)),'${req.body.outletid}','${req.body.remark}','${req.body.empid}',sysdate(),curdate(),'${req.body.zoneid}','${req.body.divid}','${req.body.lat}','${req.body.lag}','${req.body.hospitalname}')`,
    console.log(`INSERT INTO crm_dev_db.cor_outlet_activity_m (id,outlet_id, remark, enter_by,enter_date,activity_date,zone_id,division_m,act_lat,act_long,hospital_name)
    VALUES ((select crm_dev_db.all_auto_no(66)),'${req.body.outletid}','${req.body.remark}','${req.body.empid}',sysdate(),curdate(),'${req.body.zoneid}','${req.body.divid}','${req.body.lat}','${req.body.lag}','${req.body.hospitalname}')`),
    (err, res) => {
      console.log("osbss: ", res);
      if (err) {
        result({ error: true, data: "Something Went Wrong" })
      }
      result({ error: false, data: res })
    });
};

outlet.outlet_activity = async (req, result) => {
  const divisionM = req.body.divid; // Get the user's division from request
  
  // Query to fetch remarks based on the user's division
  const getRemarksQuery = `
    SELECT remarks_m 
    FROM crm_dev_db.cor_activity_m 
    WHERE division_m = '${divisionM}' AND status = 'A'
  `;

  sql.query(getRemarksQuery, (err, res) => {
    if (err) {
      console.error("Error fetching remarks: ", err);
      return result({ error: true, data: "Something Went Wrong" });
    }

    if (res.length === 0) {
      return result({ error: true, data: "No remarks available for the given division" });
    }

    result({ error: false, data: res });
  });
};



////validationActivity

outlet.validationActivity = async (req, result) => {

  sql.query(`select outlet_id,activity_date from romsondb.cor_outlet_activity_m where DATE(enter_date) = CURDATE()`,
    (err, res) => {
      console.log("osbss: ", res);
      if (err) {
        result({ error: true, data: "Something Went Wrong" })
      }
      result({ error: false, data: res })
    });
};


/////ho_customer

outlet.hospitalContact = (req, result) => {
  sql.query(`SELECT * FROM crm_dev_db.cor_hospital_customer_m where outlet_id = '${req.body.outletID}'`,
    (err, res) => {
      console.log("osbss: ", res);
      if (err) {
        result({ error: true, data: "Something Went Wrong" })
      }
      result({ error: false, data: res })
    });
};

outlet.customeradd = (req, result) => {

  sql.query(`INSERT INTO 
    romsondb.cor_hospital_customer_m (
    outlet_id,
    hospital_name,
    customer_name,
    customer_type,
    customer_department,
    customer_designation,
    customer_contact_no,
    email,
    enter_by,
    enter_date)
    VALUES (
    '${req.body.outletID}',
    '${req.body.hospitalname}',
    '${req.body.customername}',
    '${req.body.customertype}',
    '${req.body.customerdpt}',
    '${req.body.customerdesignation}',
    '${req.body.customerPno}',
    '${req.body.email}',
    '${req.body.enterby}',
    sysdate()
     )`,
    console.log(`INSERT INTO 
     romsondb.cor_hospital_customer_m (
     outlet_id,
     hospital_name,
     customer_name,
     customer_type,
     customer_department,
     customer_designation,
     customer_contact_no,
     email,
     enter_by,
     enter_date)
     VALUES (
     '${req.body.outletID}',
     '${req.body.hospitalname}',
     '${req.body.customername}',
     '${req.body.customertype}',
     '${req.body.customerdpt}',
     '${req.body.customerdesignation}',
     '${req.body.customerPno}',
     '${req.body.email}',
     '${req.body.enterby}',
     sysdate()
      )`),
    (err, res) => {
      console.log("osbss: ", res);
      if (!err) {
        result({ msg: "Sucessfully Submit Date", data: res })
      }
      result({ msg: "Something Went Wrong" })
    });
};


outlet.updateCustomer = (req, result) => {
  sql.query(`UPDATE romsondb.cor_hospital_customer_m
  SET email = '${req.body.email}', 
  customer_contact_no = '${req.body.customer_contact_no}'
  WHERE hospital_customer_id = '${req.body.hospital_customer_id}'`,

    (err, res) => {
      console.log("osbss: ", res);
      if (err) {
        result({ error: true, data: "Something Went Wrong" })
      }
      result({ error: false, data: res })
    });
};

outlet.CustomerDetailShow = (req, result) => {
  sql.query(`SELECT hospital_customer_id,email,customer_contact_no,customer_department FROM 
  romsondb.cor_hospital_customer_m where hospital_customer_id='${req.body.hospital_customer_id}'`,
    (err, res) => {
      console.log("osbss: ", res);
      if (err) {
        result({ error: true, data: "Something Went Wrong" })
      }
      result({ error: false, data: res })
    });
};




function ActivityAutoNo() {
  return new Promise((resolve, reject) => {
    sql.query(
      `(select crm_dev_db.all_auto_no(66))`,
      console.log(`(select crm_dev_db.all_auto_no(66))`),
      (err, result) => {
        console.log(result);
        resolve(result);
      }
    );
  });
}

module.exports = outlet;