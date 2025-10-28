const { error, log } = require("console");
const sql = require("../db.js");
const crypto = require('crypto');
const moment = require('moment-timezone');

// constructor
const attendance = function (osbs) {
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


attendance.ValidationAttendance = (req, result) => {
  sql.query(`SELECT status,emp_id FROM romsondb.cor_attendance_m where punch_date = curdate() and enter_by='${req.body.enterBy}'`, (err, res) => {
    console.log("osbss: ", res);
    if (err) {
      result({ error: true, data: "Something Went Wrong" })
    }
    result({ error: false, data: res })
  });
};

// attendance.attendance_punch_in = (req, result) => {
//   const empId = req.body.empid;

//   // Step 1: Check employee status
//   const statusCheckQuery = `SELECT status FROM romsondb.cor_emp_m WHERE emp_id = ?`;

//   sql.query(statusCheckQuery, [empId], (err, statusRes) => {
//     if (err) {
//       result({ error: true, data: err.message });
//       return;
//     }

//     if (statusRes.length === 0) {
//       result({ error: true, message: "Employee not found." });
//       return;
//     }

//     const empStatus = statusRes[0].status;

//     if (empStatus !== 'A') {
//       result({ error: false, message: "You are not an active employee." });
//       return;
//     }

//     // Step 2: Proceed to punch-in if active
//     const attendanceQuery = `
//       INSERT INTO romsondb.cor_attendance_m
//         (attendance_id, emp_id, shift, punch_date, punch_in, in_lat, in_lng, enter_by, enter_date, in_remark, work_place, in_address, app_version)
//       SELECT
//         romsondb.all_auto_no(55),
//         ?, 'D', CURDATE(), NOW(), ?, ?, ?, NOW(), ?, ?, ?, ?
//       FROM
//         DUAL
//       WHERE
//         NOT EXISTS (
//           SELECT 1 FROM romsondb.cor_attendance_m
//           WHERE emp_id = ? AND punch_date = CURDATE()
//         );
//     `;

//     const params = [
//       empId,
//       req.body.in_lat,
//       req.body.in_lng,
//       req.body.enterBy,
//       req.body.emp_in_rmrk,
//       req.body.emp_workplace,
//       req.body.emp_in_address,
//       req.body.app_version,
//       empId
//     ];

//     sql.query(attendanceQuery, params, (err, res) => {
//       if (err) {
//         result({ error: true, data: err.message });
//         return;
//       }

//       if (res.affectedRows > 0) {
//         result({ success: true, message: "Attendance recorded successfully." });
//       } else {
//         result({ msg: true, message: "Attendance already exists for today." });
//       }
//     });
//   });
// };

///////////////add



////////////////////add new logic=> user can not punch attendance, same day leave applied already//////////////////

function versionToNumber(version) {
  const parts = version.split('.').map(Number);
  return parts[0] * 10000 + (parts[1] || 0) * 100 + (parts[2] || 0);
}

attendance.attendance_punch_in = (req, result) => {
  const empId = req.body.empid;
  const clientVersion = req.body.app_version;
  const minVersion = '7.0.0';

  if (versionToNumber(clientVersion) < versionToNumber(minVersion) && versionToNumber(clientVersion) != 0) {
    result({ msg: true, message: "You are using older version, please update the app from Play Store." });
    return;
  }
  // Step 1: Check employee status
  const statusCheckQuery = `SELECT status FROM romsondb.cor_emp_m WHERE emp_id = ?`;

  sql.query(statusCheckQuery, [empId], (err, statusRes) => {
    if (err) {
      result({ error: true, data: err.message });
      return;
    }

    if (statusRes.length === 0) {
      result({ error: true, message: "Employee not found." });
      return;
    }

    const empStatus = statusRes[0].status;

    if (empStatus !== 'A') {
      result({ error: false, message: "You are not an active employee." });
      return;
    }

    // ✅ Step 2: Check if user has already applied for leave today
    const leaveCheckQuery = `
      SELECT 1 FROM romsondb.cor_leave_m 
      WHERE emp_id = ? 
        AND CURDATE() BETWEEN start_date AND end_date
        AND status IN (1, 2)`;

    sql.query(leaveCheckQuery, [empId], (err, leaveRes) => {
      if (err) {
        result({ error: true, data: "Error checking leave status." });
        return;
      }

      if (leaveRes.length > 0) {
        result({ error: true, message: "You have already applied for leave today. Punch-in not allowed." });
        return;
      }

      // ✅ Step 3: Proceed to punch-in if no leave found
      const attendanceQuery = `
        INSERT INTO romsondb.cor_attendance_m
          (attendance_id, emp_id, shift, punch_date, punch_in, in_lat, in_lng, enter_by, enter_date, in_remark, work_place, in_address, app_version)
        SELECT
          romsondb.all_auto_no(55),
          ?, 'D', CURDATE(), NOW(), ?, ?, ?, NOW(), ?, ?, ?, ?
        FROM
          DUAL
        WHERE
          NOT EXISTS (
            SELECT 1 FROM romsondb.cor_attendance_m
            WHERE emp_id = ? AND punch_date = CURDATE()
          );
      `;

      const params = [
        empId,
        req.body.in_lat,
        req.body.in_lng,
        req.body.enterBy,
        req.body.emp_in_rmrk,
        req.body.emp_workplace,
        req.body.emp_in_address,
        req.body.app_version,
        empId
      ];

      sql.query(attendanceQuery, params, (err, res) => {
        if (err) {
          result({ error: true, data: err.message });
          return;
        }

        if (res.affectedRows > 0) {
          result({ success: true, message: "Attendance recorded successfully." });
        } else {
          result({ msg: true, message: "Attendance already exists for today." });
        }
      });
    });
  });
};


attendance.attendance_punchout = (req, result) => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();


  if (currentHour > 14 || (currentHour === 14 && currentMinute > 0)) {
    result({ error: true, message: "You are not allowed to punch out after 7:30 PM IST" });
    return;
  }

  // Check if the punch-out already exists for the user today
  sql.query(`
      SELECT * FROM romsondb.cor_attendance_m 
      WHERE emp_id = '${req.body.empid}' 
      AND punch_date = curdate() 
      AND punch_out IS NOT NULL`,
    (err, res) => {
      if (err) {
        result({ error: true, message: "Something went wrong while checking punch-out" });
      } else {
        if (res.length > 0) {
          result({ error: true, message: "You have already punched out today." });
        } else {

          sql.query(`
            UPDATE romsondb.cor_attendance_m 
            SET 
                punch_out = sysdate(),
                out_lat = '${req.body.out_lat}', 
                out_long = '${req.body.out_long}', 
                out_remark = '${req.body.out_remark}', 
                out_address = '${req.body.add_res}' 
            WHERE 
                emp_id = '${req.body.empid}' 
                AND punch_date = curdate()`,
            (err, res) => {
              if (err) {
                result({ error: true, message: "Something went wrong while updating punch-out" });
              } else {
                if (res.affectedRows > 0) {
                  result({ success: true, message: "Successfully punched out" });
                } else {
                  result({ error: true, message: "Could not update punch-out, please try again" });
                }
              }
            });
        }
      }
    });
};



// attendance.attendance_punchout = (req, result) => {
//   const currentHour = new Date().getHours();

//   // Check if the current time is after 9 PM
//   if (currentHour >= 21) {
//     result({ error: true, data: "You are not allowed to punch out after 9 PM" });
//     return;
//   }

//   sql.query(`
//       UPDATE romsondb.cor_attendance_m 
//       SET 
//           punch_out = sysdate(),
//           out_lat = '${req.body.out_lat}', 
//           out_long = '${req.body.out_long}', 
//           out_remark = '${req.body.out_remark}', 
//           out_address = '${req.body.add_res}' 
//       WHERE 
//           emp_id = '${req.body.empid}' 
//           AND punch_date = curdate()`,
//     (err, res) => {
//       console.log("Response: ", res);

//       if (err) {
//         result({ error: true, data: "Something Went Wrong" });
//       } else {
//         if (res.affectedRows > 0) {  // If punch-out record updated successfully
//           result({
//             success: false,
//             message: "Successfully punched out"
//           });
//         }
//       }
//     });
// };




//   attendance.LeaveApp =  (req, result) => {
//     sql.query(`INSERT INTO romsondb.cor_leave_m(emp_id, reporting_to, leave_type, start_date, end_date, leave_days, leave_reason, enter_by,enter_date)
// values('${req.body.empID}','${req.body.rpPerson}','${req.body.leaveType}','${req.body.fromDate}','${req.body.toDate}','${req.body.numofdays}', '${req.body.leavereason}','${req.body.enterBy}',sysdate())`,
//    (err, res) => {
//       console.log("osbss: ", res);
//       if (err) {
//         result({ error: true, data: "Something Went Wrong" })
//       }
//       result({error:false, data: result,msg:"Sucessfully Submit" });
//     });
//   };


// attendance.LeaveApp = (req, result) => {
//   const { empID, rpPerson, fromDate, toDate, numofdays, leavereason, enterBy } = req.body;

//   // Determine initial leave type based on number of days
//   let conditionalLeaveType = numofdays > 2 ? 'EL' : 'CL';

//   // Query to check leave balances for the employee
//   const leaveBalanceQuery = `
//     SELECT 
//       GREATEST(
//         COALESCE(MAX(CASE WHEN sm.leave_type = 'CL' THEN sm.leave_count ELSE 0 END), 12) - 
//         COALESCE(SUM(CASE WHEN lm.leave_type = 'CL' THEN lm.leave_days ELSE 0 END), 0), 
//         0
//       ) AS cl_balance,
//       GREATEST(
//         COALESCE(MAX(CASE WHEN sm.leave_type = 'EL' THEN sm.leave_count ELSE 0 END), 15) - 
//         COALESCE(SUM(CASE WHEN lm.leave_type = 'EL' THEN lm.leave_days ELSE 0 END), 0), 
//         0
//       ) AS el_balance
//     FROM 
//       romsondb.cor_leave_summary sm
//     LEFT JOIN 
//       romsondb.cor_leave_m lm 
//     ON 
//       sm.emp_id = lm.emp_id 
//       AND sm.leave_type = lm.leave_type
//       AND YEAR(lm.enter_date) = YEAR(CURRENT_DATE())
//     WHERE 
//       sm.emp_id = '${empID}'
//     GROUP BY 
//       sm.emp_id`;

//   sql.query(leaveBalanceQuery, (err, balanceRes) => {
//     if (err) {
//       console.log(err);
//       result({ error: true, data: "Something Went Wrong" });
//       return;
//     }

//     // Extract leave balances or assign default values
//     const { cl_balance, el_balance } = balanceRes[0] || { cl_balance: 12, el_balance: 15 };

//     // Determine final leave type based on balance and number of days
//     let lopMessage = null;

//     // Check if EL or CL balance is sufficient for the requested leave
//     if (conditionalLeaveType === 'EL' && el_balance > 0) {
//       // EL leave requested and balance is available
//       conditionalLeaveType = 'EL';
//     } else if (conditionalLeaveType === 'CL' && cl_balance > 0) {
//       // CL leave requested and balance is available
//       conditionalLeaveType = 'CL';
//     } else {
//       // If both balances are zero or the requested leave type is not available, set to LOP
//       conditionalLeaveType = 'LOP';
//       lopMessage = "You do not have sufficient leave balance. Your leave will be marked as LOP (Loss of Pay).";
//     }

//     // Check for overlapping leave applications
//     const overlapCheckQuery = `
//       SELECT * FROM romsondb.cor_leave_m 
//       WHERE emp_id = '${empID}' 
//       AND (
//         (start_date <= '${fromDate}' AND end_date >= '${fromDate}') OR
//         (start_date <= '${toDate}' AND end_date >= '${toDate}') OR
//         (start_date >= '${fromDate}' AND end_date <= '${toDate}')
//       )`;

//     sql.query(overlapCheckQuery, (err, res) => {
//       if (err) {
//         console.log(err);
//         result({ error: true, data: "Something Went Wrong" });
//         return;
//       }

//       if (res.length > 0) {
//         result({ error: true, data: "Leave already applied for the selected dates" });
//         return;
//       }

//       // Insert leave application with the determined leave type
//       const insertLeaveQuery = `
//         INSERT INTO romsondb.cor_leave_m 
//           (emp_id, reporting_to, leave_type, start_date, end_date, leave_days, leave_reason, enter_by, enter_date)
//         VALUES 
//           ('${empID}', '${rpPerson}', '${conditionalLeaveType}', '${fromDate}', '${toDate}', '${numofdays}', '${leavereason}', '${enterBy}', sysdate())`;

//       sql.query(insertLeaveQuery, (err, insertRes) => {
//         if (err) {
//           console.log(err);
//           result({ error: true, data: "Something Went Wrong" });
//           return;
//         }

//         // Provide appropriate response message
//         result({
//           error: false,
//           data: insertRes,
//           msg: lopMessage
//             ? lopMessage + " Leave application submitted successfully."
//             : "Leave application submitted successfully.",
//         });
//       });
//     });
//   });
// };





attendance.LeaveApp = (req, result) => {
  const { empID, rpPerson, fromDate, toDate, numofdays, leavereason, enterBy, leaveType } = req.body;

  if (!leaveType) {
    result({ error: true, data: "Leave type is required" });
    return;
  }

  let conditionalLeaveType = leaveType.trim().toUpperCase();


  if (conditionalLeaveType === "ML") {
    const startDate = new Date(fromDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 6);

    const diffTime = Math.abs(endDate - startDate);
    const leaveDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const endDateStr = endDate.toISOString().split("T")[0];

    // 🔍 Overlap check
    const overlapCheckQuery = `
      SELECT * FROM crm_dev_db.cor_leave_m
      WHERE emp_id = '${empID}'
      AND (
        (start_date <= '${fromDate}' AND end_date >= '${fromDate}') OR
        (start_date <= '${endDateStr}' AND end_date >= '${endDateStr}') OR
        (start_date >= '${fromDate}' AND end_date <= '${endDateStr}')
      )`;

    sql.query(overlapCheckQuery, (err, res) => {
      if (err) {
        console.log(err);
        result({ error: true, data: "Something Went Wrong" });
        return;
      }

      if (res.length > 0) {
        result({ error: true, data: "Leave already applied for the selected dates" });
        return;
      }

      ////////////////////ML-INSERT////////////////////////////
      const insertLeaveQuery = `
        INSERT INTO crm_dev_db.cor_leave_m 
          (emp_id, reporting_to, leave_type, start_date, end_date, leave_days, leave_reason, enter_by, enter_date)
        VALUES 
          ('${empID}', '${rpPerson}', '${conditionalLeaveType}', '${fromDate}', '${endDateStr}', ${leaveDays}, '${leavereason}', '${enterBy}', sysdate())`;

      sql.query(insertLeaveQuery, (err, insertRes) => {
        if (err) {
          console.log(err);
          result({ error: true, data: "Something Went Wrong" });
          return;
        }

        result({
          error: false,
          data: insertRes,
          msg: `Maternity Leave applied successfully for ${leaveDays} days (${fromDate} to ${endDateStr}).`
        });
      });
    });

    return;
  }

  // ✅ For CL, EL, SL → check balances
  const leaveBalanceQuery = `
    SELECT 
      GREATEST(COALESCE(MAX(CASE WHEN sm.leave_type = 'CL' THEN sm.leave_count ELSE 0 END),0) - 
              COALESCE(SUM(CASE WHEN lm.leave_type = 'CL' THEN lm.leave_days ELSE 0 END),0),0) AS cl_balance,
      GREATEST(COALESCE(MAX(CASE WHEN sm.leave_type = 'EL' THEN sm.leave_count ELSE 0 END),0) - 
              COALESCE(SUM(CASE WHEN lm.leave_type = 'EL' THEN lm.leave_days ELSE 0 END),0),0) AS el_balance,
      GREATEST(COALESCE(MAX(CASE WHEN sm.leave_type = 'SL' THEN sm.leave_count ELSE 0 END),0) - 
              COALESCE(SUM(CASE WHEN lm.leave_type = 'SL' THEN lm.leave_days ELSE 0 END),0),0) AS sl_balance
    FROM crm_dev_db.cor_leave_summary sm
    LEFT JOIN crm_dev_db.cor_leave_m lm 
      ON sm.emp_id = lm.emp_id 
      AND sm.leave_type = lm.leave_type
      AND YEAR(lm.enter_date) = YEAR(CURRENT_DATE())
    WHERE sm.emp_id = '${empID}'
    GROUP BY sm.emp_id`;

  sql.query(leaveBalanceQuery, (err, balanceRes) => {
    if (err) {
      console.log(err);
      result({ error: true, data: "Something Went Wrong" });
      return;
    }

    const { cl_balance = 0, el_balance = 0, sl_balance = 0 } = balanceRes[0] || {};
    let selectedBalance = 0;

    // Balance check only for CL/EL/SL///////////////////////////////
    selectedBalance =
      conditionalLeaveType === 'CL' ? cl_balance :
        conditionalLeaveType === 'EL' ? el_balance :
          conditionalLeaveType === 'SL' ? sl_balance : 0;

    if (selectedBalance <= 0) {
      const otherBalances = { CL: cl_balance, EL: el_balance, SL: sl_balance };
      delete otherBalances[conditionalLeaveType];

      const hasOtherBalance = Object.values(otherBalances).some(b => b > 0);

      if (hasOtherBalance) {
        result({ error: true, data: `No ${conditionalLeaveType} balance available. Please select another leave type.` });
        return;
      } else {
        conditionalLeaveType = 'LOP';
      }
    }


    console.log("Balances => CL:", cl_balance, "EL:", el_balance, "SL:", sl_balance);
    console.log("Selected leaveType:", conditionalLeaveType, "Selected balance:", selectedBalance);

    // 🔍 Overlap check
    const overlapCheckQuery = `
      SELECT * FROM crm_dev_db.cor_leave_m
      WHERE emp_id = '${empID}'
      AND (
        (start_date <= '${fromDate}' AND end_date >= '${fromDate}') OR
        (start_date <= '${toDate}' AND end_date >= '${toDate}') OR
        (start_date >= '${fromDate}' AND end_date <= '${toDate}')
      )`;

    sql.query(overlapCheckQuery, (err, res) => {
      if (err) {
        console.log(err);
        result({ error: true, data: "Something Went Wrong" });
        return;
      }

      if (res.length > 0) {
        result({ error: true, data: "Leave already applied for the selected dates" });
        return;
      }

      const insertLeaveQuery = `
        INSERT INTO crm_dev_db.cor_leave_m 
          (emp_id, reporting_to, leave_type, start_date, end_date, leave_days, leave_reason, enter_by, enter_date)
        VALUES 
          ('${empID}', '${rpPerson}', '${conditionalLeaveType}', '${fromDate}', '${toDate}', ${numofdays}, '${leavereason}', '${enterBy}', sysdate())`;

      sql.query(insertLeaveQuery, (err, insertRes) => {
        if (err) {
          console.log(err);
          result({ error: true, data: "Something Went Wrong" });
          return;
        }

        result({
          error: false,
          data: insertRes,
          msg: conditionalLeaveType === 'LOP'
            ? "No leave balances available. Leave marked as LOP."
            : "Leave application submitted successfully."
        });
      });
    });
  });
};


// attendance.LeaveApp = (req, result) => {
//   const { empID, rpPerson, fromDate, toDate, numofdays, leavereason, enterBy } = req.body;

//   // Get leave counter from cor_shift_m table
//   const leaveLimitQuery = `SELECT leave_counter FROM romsondb.cor_shift_m WHERE leave_counter IS NOT NULL LIMIT 1`;

//   sql.query(leaveLimitQuery, (err, limitRes) => {
//     if (err) {
//       console.log(err);
//       result({ error: true, data: "Something Went Wrong" });
//       return;
//     }

//     // Default to 15 if no leave_counter is found
//     const maxLeaveLimit = limitRes.length > 0 ? limitRes[0].leave_counter : 15;

//     // **Validation for maximum leave days** - Ensure user cannot apply for more than 15 days at once
//     if (numofdays > maxLeaveLimit) {
//       result({ error: true, data: `You cannot apply for more than ${maxLeaveLimit} leaves at once.` });
//       return;
//     }

//     // Determine the initial leave type based on number of days
//     let conditionalLeaveType;
//     if (numofdays === 1) {
//       conditionalLeaveType = 'SL';
//     } else if (numofdays === 2) {
//       conditionalLeaveType = 'CL';
//     } else {
//       conditionalLeaveType = 'EL';
//     }

//     // Query to check leave balances for the employee
//     const leaveBalanceQuery = `
//       SELECT 
//         GREATEST(
//           COALESCE(MAX(CASE WHEN sm.leave_type = 'CL' THEN sm.leave_count ELSE 0 END), 12) - 
//           COALESCE(SUM(CASE WHEN lm.leave_type = 'CL' THEN lm.leave_days ELSE 0 END), 0), 
//           0
//         ) AS cl_balance,
//         GREATEST(
//           COALESCE(MAX(CASE WHEN sm.leave_type = 'EL' THEN sm.leave_count ELSE 0 END), 15) - 
//           COALESCE(SUM(CASE WHEN lm.leave_type = 'EL' THEN lm.leave_days ELSE 0 END), 0), 
//           0
//         ) AS el_balance,
//         GREATEST(
//           COALESCE(MAX(CASE WHEN sm.leave_type = 'SL' THEN sm.leave_count ELSE 0 END), 6) - 
//           COALESCE(SUM(CASE WHEN lm.leave_type = 'SL' THEN lm.leave_days ELSE 0 END), 0), 
//           0
//         ) AS sl_balance
//       FROM 
//         romsondb.cor_leave_summary sm
//       LEFT JOIN 
//         romsondb.cor_leave_m lm 
//       ON 
//         sm.emp_id = lm.emp_id 
//       AND sm.leave_type = lm.leave_type
//        AND YEAR(lm.enter_date) = YEAR(CURRENT_DATE())
//      WHERE 
//        sm.emp_id = '${empID}'
//      GROUP BY 
//        sm.emp_id`;

//     sql.query(leaveBalanceQuery, (err, balanceRes) => {
//       if (err) {
//         console.log(err);
//         result({ error: true, data: "Something Went Wrong" });
//         return;
//       }

//       // Extract leave balances or assign default values
//       const { cl_balance, el_balance, sl_balance } = balanceRes[0] || { cl_balance: 12, el_balance: 15, sl_balance: 6 };

//       // Determine the final leave type based on balance and number of days
//       let lopMessage = null;

//       if (conditionalLeaveType === 'SL' && sl_balance > 0) {
//         conditionalLeaveType = 'SL';
//       } else if (conditionalLeaveType === 'CL' && cl_balance > 0) {
//         conditionalLeaveType = 'CL';
//       } else if (conditionalLeaveType === 'EL' && el_balance > 0) {
//         conditionalLeaveType = 'EL';
//       } else {
//         conditionalLeaveType = 'LOP';
//         lopMessage = "You do not have sufficient leave balance. Your leave will be marked as LOP (Loss of Pay).";
//       }

//       // Check for overlapping leave applications
//       const overlapCheckQuery = `
//         SELECT * 
// FROM romsondb.cor_leave_m 
// WHERE 
//   (
//     (start_date <= '${fromDate}' AND end_date >= '${fromDate}') OR
//     (start_date <= '${toDate}' AND end_date >= '${toDate}') OR
//     (start_date >= '${fromDate}' AND end_date <= '${toDate}')
//   )
// `;

//       sql.query(overlapCheckQuery, (err, res) => {
//         if (err) {
//           console.log(err);
//           result({ error: true, data: "Something Went Wrong" });
//           return;
//         }

//         if (res.length > 0) {
//           result({ error: true, data: "Leave already applied for the selected dates" });
//           return;
//         }

//         // Insert leave application with the determined leave type
//         // Check if the user is applying for 15 or fewer days, in that case, use the direct leave_counter from cor_shift_m table
//         const leaveCounter = numofdays <= 15 ? limitRes[0].leave_counter : 'default_leave_counter';

//         const insertLeaveQuery = `
//           INSERT INTO romsondb.cor_leave_m 
//             (leave_counter, reporting_to, leave_type, start_date, end_date, leave_days, leave_reason, enter_by, enter_date)
//           VALUES 
//             ('${leaveCounter}', '${rpPerson}', '${conditionalLeaveType}', '${fromDate}', '${toDate}', '${numofdays}', '${leavereason}', '${enterBy}', sysdate())`;

//         sql.query(insertLeaveQuery, (err, insertRes) => {
//           if (err) {
//             console.log(err);
//             result({ error: true, data: "Something Went Wrong" });
//             return;
//           }

//           // Provide appropriate response message
//           result({
//             error: false,
//             data: insertRes,
//             msg: lopMessage
//               ? lopMessage + " Leave application submitted successfully."
//               : "Leave application submitted successfully.",
//           });
//         });
//       });
//     });
//   });
// };


attendance.LeaveCount = (req, result) => {
  sql.query(`SELECT sum(leave_days) as leaveTake FROM crm_dev_db.cor_leave_m where emp_id='${req.body.empid}'  AND YEAR(enter_date) = YEAR(CURRENT_DATE());`,
    (err, res) => {
      console.log("osbss: ", res);
      if (err) {
        result({ error: true, data: "Something Went Wrong" })
      }
      result(res)
    });
};


// attendance.attandance_count = (req, result) => {
//   const punchDate = req.query.punch_date; // Date parameter
//   const empId = req.query.emp_id; // Employee ID parameter (optional)

//   var user = JSON.parse(req.headers.authorization);

//   if (user.role == 1) {

//     // Base query
//     let query = `
//       SELECT 
//         -- Generate fixed unique ID for absent records
//         CASE 
//           WHEN a.attendance_id IS NOT NULL THEN a.attendance_id
//           ELSE CONCAT('A-', LPAD(CONV(FLOOR(RAND() * 10000), 10, 36), 4, '0')) -- Random ID for absent records (not fixed)
//         END AS attendance_id,

//         d.punch_date, 
//         IFNULL(TIME(a.punch_in), '00:00:00') AS punch_in_time,
//         IFNULL(TIME(a.punch_out), '00:00:00') AS punch_out_time,
//         e.emp_id,
//         e.emp_code, 
//         e.user_name,

//         CASE
//           WHEN e.emp_code BETWEEN 'D001' AND 'D999' THEN 'RGPL'
//           WHEN e.emp_code BETWEEN 'D1000' AND 'D1999' THEN 'Romsons Medsource'
//           WHEN e.emp_code LIKE 'R1%' OR e.emp_code LIKE 'R500%' THEN 'RGPL'
//           WHEN e.emp_code BETWEEN 'MS001' AND 'MS999' THEN 'Romsons Medsource'
//           WHEN e.emp_code BETWEEN 'R0001' AND 'R9999' THEN 'RPPL'
//           WHEN e.emp_code BETWEEN 'RX01' AND 'RX099' THEN 'RENNEX MEDICAL'
//           ELSE 'Unknown'
//         END AS company_name,

//         CASE
//           WHEN a.leave_status = 2 THEN 'L'
//           WHEN a.leave_status = 1 THEN 'A'
//           WHEN a.status = 1 THEN 'P'
//           WHEN a.status IS NULL THEN 'A'
//           ELSE 'A'
//         END AS attendance_status,

//         CASE 
//           WHEN a.leave_status = 2 THEN IF(l.leave_type = 'CL', 'CL', IF(l.leave_type = 'EL', 'EL', '0'))
//           ELSE '0'
//         END AS leave_type,

//         IF(a.status = 1 AND a.punch_in IS NOT NULL AND a.punch_out IS NOT NULL, 
//           TIMESTAMPDIFF(HOUR, a.punch_in, a.punch_out), 
//           0
//         ) AS total_hours
//       FROM 
//         (SELECT ? AS punch_date) d
//       LEFT JOIN 
//         romsondb.cor_emp_m e ON 1 = 1
//       LEFT JOIN 
//         romsondb.cor_attendance_m a ON e.emp_id = a.emp_id AND a.punch_date = d.punch_date
//       LEFT JOIN 
//         romsondb.cor_leave_m l ON e.emp_id = l.emp_id AND l.start_date = d.punch_date
//     `;

//     // Filter by employee ID if provided
//     if (empId) {
//       query += ` WHERE e.emp_id = ?`;
//     }

//     // Execute the query
//     const queryParams = empId ? [punchDate, empId] : [punchDate];

//     sql.query(query, queryParams, (err, res) => {
//       if (err) {
//         console.error("Query Error: ", err);
//         result({ error: true, data: "Something Went Wrong" });
//       } else {
//         // Generate a fixed unique ID for each absent record
//         const fixedIdResults = res.map(record => {
//           if (record.attendance_status === 'A') {
//             // Generate a fixed unique ID
//             record.attendance_id = crypto.createHash('md5').update(record.emp_id + record.punch_date).digest('hex').substring(0, 10).toUpperCase();
//           }
//           return record;
//         });

//         console.log("Query Results: ", fixedIdResults);
//         result(fixedIdResults);
//       }
//     });
//   }
// };


// attendance.attandance_count = (req, result) => {
//   const punchDate = req.query.punch_date; // Date parameter (YYYY-MM-DD)
//   const empId = req.query.emp_id; // Employee ID parameter (optional)

//   var user = JSON.parse(req.headers.authorization);

//   if (user.role == 1) {
//     // Base query
//     let query = `
//       SELECT 
//         a.attendance_id,
//         d.punch_date, 
//         IFNULL(TIME(a.punch_in), '00:00:00') AS punch_in_time,
//         IFNULL(TIME(a.punch_out), '00:00:00') AS punch_out_time,
//         e.emp_id,
//         TRIM(e.emp_code) AS emp_code, -- Trim whitespace from emp_code
//         TRIM(e.user_name) AS user_name, -- Trim whitespace from user_name

//         -- Ensure all RX prefixed codes map to RENNEX MEDICAL
//         COALESCE(
//           CASE
//             WHEN e.emp_code BETWEEN 'D0001' AND 'D9999' THEN 'RGPL'
//             WHEN e.emp_code BETWEEN 'R01' AND 'R99' THEN 'RGPL'
//             WHEN e.emp_code BETWEEN 'MS001' AND 'MS999' THEN 'Romsons Medsource'
//             WHEN e.emp_code LIKE 'RP%' THEN 'RPPL'
//             WHEN e.emp_code BETWEEN 'RX001' AND 'RX999' THEN 'RENNEX MEDICAL'
//           END,
//           'Unknown'
//         ) AS company_name,

//         CASE
//           WHEN a.leave_status = 2 THEN 'L'
//           WHEN a.leave_status = 1 THEN 'A'
//           WHEN a.status = 1 AND a.punch_out IS NULL THEN 'A'
//           WHEN a.status = 1 THEN 'P'
//           WHEN a.status IS NULL THEN 'A'
//           ELSE 'A'
//         END AS attendance_status,

//         CASE 
//           WHEN a.leave_status = 2 THEN IF(l.leave_type = 'CL', 'CL', IF(l.leave_type = 'EL', 'EL', '0'))
//           ELSE '0'
//         END AS leave_type,

//         IF(a.status = 1 AND a.punch_in IS NOT NULL AND a.punch_out IS NOT NULL, 
//           TIMESTAMPDIFF(HOUR, a.punch_in, a.punch_out), 
//           0
//         ) AS total_hours
//       FROM 
//         (SELECT ? AS punch_date) d
//       LEFT JOIN 
//         romsondb.cor_emp_m e ON 1 = 1
//       LEFT JOIN 
//         romsondb.cor_attendance_m a ON e.emp_id = a.emp_id AND a.punch_date = d.punch_date
//       LEFT JOIN 
//         romsondb.cor_leave_m l ON e.emp_id = l.emp_id AND l.start_date = d.punch_date
//       WHERE 
//         e.status = 'A'  -- Only fetch active users
//       GROUP BY 
//         a.attendance_id  -- Ensure only unique attendance IDs are included
//     `;

//     if (empId) {
//       query += ` AND e.emp_id = ?`; // Add to existing WHERE clause
//     }

//     const queryParams = empId ? [punchDate, empId] : [punchDate];

//     sql.query(query, queryParams, (err, res) => {
//       if (err) {
//         console.error("Query Error: ", err);
//         result({ error: true, data: "Something Went Wrong" });
//       } else {
//         const convertedResults = res.map(record => {
//           if (record.punch_in_time !== '00:00:00') {
//             record.punch_in_time = moment
//               .tz(record.punch_in_time, 'HH:mm:ss', 'GMT')
//               .tz('Asia/Kolkata')
//               .format('h:mm A');
//           }

//           if (record.punch_out_time !== '00:00:00') {
//             record.punch_out_time = moment
//               .tz(record.punch_out_time, 'HH:mm:ss', 'GMT')
//               .tz('Asia/Kolkata')
//               .format('h:mm A');
//           }

//           record.emp_code = record.emp_code ? record.emp_code.trim() : record.emp_code;

//           if (record.attendance_status === 'A' && !record.attendance_id) {
//             const fixedPrefix = '100';
//             const uniqueKey = `${record.emp_id}-${punchDate}`;
//             const hash = crypto.createHash('sha256')
//               .update(uniqueKey)
//               .digest('hex');
//             const uniqueSuffix = Math.abs(parseInt(hash.slice(-5), 16)) % 100000;
//             record.attendance_id = fixedPrefix * 100000 + uniqueSuffix;
//           }

//           return record;
//         });

//         console.log("Query Results: ", convertedResults);
//         result({
//           error: false,
//           data: convertedResults
//         });
//       }
//     });
//   }
// };



// attendance.attandance_count = (req, result) => {
//   const punchDate = req.query.punch_date; // Date parameter (YYYY-MM-DD)
//   const empId = req.query.emp_id; // Employee ID parameter (optional)

//   const user = JSON.parse(req.headers.authorization);

//   if (user.role === 1) {
//     let query = `
//       SELECT 
//         IFNULL(a.attendance_id, NULL) AS attendance_id,
//         d.punch_date, 
//         COALESCE(TIME(a.punch_in), '00:00:00') AS punch_in_time,
//         COALESCE(TIME(a.punch_out), '00:00:00') AS punch_out_time,
//         e.emp_id,
//         TRIM(e.emp_code) AS emp_code, 
//         TRIM(e.user_name) AS user_name, 

//         'RGPL' AS company_name,

//         CASE 
//          WHEN e.state_id = 39 AND DAYOFWEEK(d.punch_date) = 7 AND a.punch_in IS NULL AND a.punch_out IS NULL THEN 'WEO' 
//           WHEN DAYOFWEEK(d.punch_date) = 1 THEN 
//             CASE 
//               WHEN a.leave_status = 2 THEN 'L' -- Leave applied on Sunday
//               WHEN a.punch_in IS NULL AND a.punch_out IS NULL THEN 'WEO' 
//               ELSE 
//                 CASE 
//                   WHEN a.leave_status = 1 THEN 'A'
//                   WHEN a.status = 1 AND TIMESTAMPDIFF(HOUR, a.punch_in, a.punch_out) >= 8 THEN 'P' 
//                   WHEN a.status = 1 AND TIMESTAMPDIFF(HOUR, a.punch_in, a.punch_out) >= 4 THEN 'ABSHD' 
//                   ELSE 'A'
//                 END 
//             END
//           ELSE 
//             CASE 
//               WHEN a.leave_status = 2 THEN 'L'
//               WHEN a.leave_status = 1 THEN 'A'
//               WHEN a.status = 1 AND TIMESTAMPDIFF(HOUR, a.punch_in, a.punch_out) >= 8 THEN 'P' 
//               WHEN a.status = 1 AND TIMESTAMPDIFF(HOUR, a.punch_in, a.punch_out) >= 4 THEN 'ABSHD' 
//               ELSE 'A'
//             END
//         END AS attendance_status,

//         CASE 
//           WHEN a.leave_status = 2 THEN 
//             COALESCE(l.leave_type, '0')  
//           ELSE 
//             '0'  
//         END AS leave_type,

//         IF(a.status = 1 AND a.punch_in IS NOT NULL AND a.punch_out IS NOT NULL, 
//           TIMESTAMPDIFF(HOUR, a.punch_in, a.punch_out), 
//           0
//         ) AS total_hours
//       FROM 
//         (SELECT ? AS punch_date) d
//       LEFT JOIN 
//         romsondb.cor_emp_m e ON 1 = 1
//       LEFT JOIN 
//         romsondb.cor_attendance_m a ON e.emp_id = a.emp_id AND a.punch_date = d.punch_date
//       LEFT JOIN 
//         romsondb.cor_leave_m l ON e.emp_id = l.emp_id 
//         AND l.start_date <= d.punch_date 
//         AND (l.end_date >= d.punch_date OR l.end_date IS NULL)
//       WHERE 
//         e.status = 'A'
//     `;

//     if (empId) {
//       query += ` AND e.emp_id = ?`;
//     }

//     const queryParams = empId ? [punchDate, empId] : [punchDate];

//     sql.query(query, queryParams, (err, res) => {
//       if (err) {
//         console.error("Query Error: ", err);
//         result({ error: true, message: "Failed to fetch attendance data" });
//         return;
//       }

//       const convertedResults = res.map(record => {
//         // Convert punch-in and punch-out times
//         if (record.punch_in_time !== '00:00:00') {
//           record.punch_in_time = moment
//             .tz(record.punch_in_time, 'HH:mm:ss', 'GMT')
//             .tz('Asia/Kolkata')
//             .format('h:mm A');
//         }

//         if (record.punch_out_time !== '00:00:00') {
//           record.punch_out_time = moment
//             .tz(record.punch_out_time, 'HH:mm:ss', 'GMT')
//             .tz('Asia/Kolkata')
//             .format('h:mm A');
//         }

//         // Ensure consistent format for attendance_id
//         if (!record.attendance_id) {
//           const fixedPrefix = '100';
//           const uniqueKey = `${record.emp_id}-${record.punch_date}`;
//           const hash = crypto.createHash('sha256')
//             .update(uniqueKey)
//             .digest('hex');
//           const uniqueSuffix = Math.abs(parseInt(hash.slice(-5), 16)) % 100000;
//           record.attendance_id = `${fixedPrefix}${String(uniqueSuffix).padStart(5, '0')}`;
//         }

//         return record;
//       });

//       result({ error: false, data: convertedResults });
//     });
//   } else {
//     result({ error: true, message: "Unauthorized access" });
//   }
// };




// attendance.attandance_count = (req, result) => {
//   const punchDate = req.query.punch_date; // Date parameter (YYYY-MM-DD)
//   const empId = req.query.emp_id; // Employee ID parameter (optional)

//   const user = JSON.parse(req.headers.authorization);

//   if (user.role === 1) {
//     let query = `
//      SELECT 
//         IFNULL(a.attendance_id, NULL) AS attendance_id,
//         d.punch_date, 
//         COALESCE(TIME(a.punch_in), '00:00:00') AS punch_in_time,
//         COALESCE(TIME(a.punch_out), '00:00:00') AS punch_out_time,
//         e.emp_id,
//         TRIM(e.emp_code) AS emp_code, 
//         TRIM(e.user_name) AS user_name, 
//         'RGPL' AS company_name,

//         -- Attendance status logic with WEO and PHY
//         CASE
//         WHEN h.date IS NOT NULL AND DAYOFWEEK(h.date) = 1 AND a.punch_in IS NULL AND a.punch_out IS NULL THEN 'WEO' -- Holiday on Sunday without punch-in/out
//             WHEN h.date IS NOT NULL AND a.punch_in IS NULL AND a.punch_out IS NULL THEN 'PHY' -- Holiday without punch-in/out
// WHEN a.leave_status = 2 THEN 'L' -- Leave applied
//     WHEN a.leave_status = 1 THEN 'A' -- Absent
//             WHEN e.state_id = 39 AND DAYOFWEEK(d.punch_date) = 7 AND a.punch_in IS NULL AND a.punch_out IS NULL THEN 'WEO' -- Saturday weekly off for specific state
//             WHEN DAYOFWEEK(d.punch_date) = 1 AND a.punch_in IS NULL AND a.punch_out IS NULL THEN 'WEO' -- Sunday weekly off
//             WHEN a.punch_in IS NULL AND a.punch_out IS NULL THEN 'A' -- Absent on non-holiday
//             WHEN a.status = 1 AND TIMESTAMPDIFF(MINUTE, a.punch_in, a.punch_out) >= 8 THEN 'P' -- Present for full day
//             WHEN a.status = 1 AND TIMESTAMPDIFF(MINUTE, a.punch_in, a.punch_out) >= 4 THEN 'ABSHD' -- Half-day absent
//             ELSE 'A' -- Default absent
//         END AS attendance_status,

//         -- Leave type logic
//         CASE 
//             WHEN a.leave_status = 2 THEN COALESCE(l.leave_type, '0')  
//             ELSE '0'  
//         END AS leave_type,

//        IF(a.status = 1 AND a.punch_in IS NOT NULL AND a.punch_out IS NOT NULL, 
//     CONCAT(FLOOR(TIMESTAMPDIFF(MINUTE, a.punch_in, a.punch_out) / 60), ' hours ', 
//            TIMESTAMPDIFF(MINUTE, a.punch_in, a.punch_out) % 60, ' minutes'), 
//     '0 hours 0 minutes'
// ) AS total_hours




//      FROM 
//         (SELECT ? AS punch_date) d
//      LEFT JOIN 
//         romsondb.cor_emp_m e ON 1 = 1
//      LEFT JOIN 
//         romsondb.cor_attendance_m a ON e.emp_id = a.emp_id AND a.punch_date = d.punch_date
//      LEFT JOIN 
//         romsondb.cor_leave_m l ON e.emp_id = l.emp_id 
//         AND l.start_date <= d.punch_date 
//         AND (l.end_date >= d.punch_date OR l.end_date IS NULL)
//      LEFT JOIN
//         romsondb.holiday_m h ON FIND_IN_SET(e.state_id, h.state_id) > 0
//   AND h.date = d.punch_date
//      WHERE 
//         e.status = 'A'
//     `;

//     if (empId) {
//       query += ` AND e.emp_id = ?`;
//     }

//     const queryParams = empId ? [punchDate, empId] : [punchDate];

//     sql.query(query, queryParams, (err, res) => {
//       if (err) {
//         console.error("Query Error: ", err);
//         result({ error: true, message: "Failed to fetch attendance data" });
//         return;
//       }

//       const convertedResults = res.map(record => {
//         // Convert punch-in and punch-out times
//         if (record.punch_in_time !== '00:00:00') {
//           record.punch_in_time = moment
//             .tz(record.punch_in_time, 'HH:mm:ss', 'GMT')
//             .tz('Asia/Kolkata')
//             .format('h:mm A');
//         }

//         if (record.punch_out_time !== '00:00:00') {
//           record.punch_out_time = moment
//             .tz(record.punch_out_time, 'HH:mm:ss', 'GMT')
//             .tz('Asia/Kolkata')
//             .format('h:mm A');
//         }

//         // Ensure consistent format for attendance_id
//         if (!record.attendance_id) {
//           const fixedPrefix = '100';
//           const uniqueKey = `${record.emp_id}-${record.punch_date}`;
//           const hash = crypto.createHash('sha256')
//             .update(uniqueKey)
//             .digest('hex');
//           const uniqueSuffix = Math.abs(parseInt(hash.slice(-5), 16)) % 100000;
//           record.attendance_id = `${fixedPrefix}${String(uniqueSuffix).padStart(5, '0')}`;
//         }

//         return record;
//       });

//       result({ error: false, data: convertedResults });
//     });
//   } else {
//     result({ error: true, message: "Unauthorized access" });
//   }
// };




// attendance.punchInOutTime = (req, result) => {
//   sql.query(`
//     SELECT 
//     DATE_FORMAT(CONVERT_TZ(punch_in, '+00:00', '+05:30'), '%h:%i %p') AS punch_in,
//     DATE_FORMAT(CONVERT_TZ(punch_out, '+00:00', '+05:30'), '%h:%i %p') AS punch_out
// FROM romsondb.cor_attendance_m 
// WHERE emp_id = '${req.body.empidd}' 
// AND (
//     DATE(CONVERT_TZ(punch_in, '+00:00', '+05:30')) = DATE(CONVERT_TZ(NOW(), '+00:00', '+05:30'))
//     OR DATE(CONVERT_TZ(punch_out, '+00:00', '+05:30')) = DATE(CONVERT_TZ(NOW(), '+00:00', '+05:30'))
// );


//   `, (err, res) => {

//     console.log("Result Data: ", res);

//     if (err) {
//       result({ error: true, data: "Something Went Wrong" });
//     } else {
//       result({ error: false, data: res });
//     }
//   });
// };



///////////////////////////attendance count///////////////////////////////

// attendance.attandance_count = (req, result) => {
//   const punchDate = req.query.punch_date;
//   const empId = req.query.emp_id;
//   const user = JSON.parse(req.headers.authorization);

//   if (user.role === 1) {
//     let query = `
//       SELECT 
//         IFNULL(a.attendance_id, NULL) AS attendance_id,
//         d.punch_date,
//         COALESCE(TIME(a.punch_in), '00:00:00') AS punch_in_time,
//         COALESCE(TIME(a.punch_out), '00:00:00') AS punch_out_time,
//         e.emp_id,
//         TRIM(e.emp_code) AS emp_code,
//         TRIM(e.user_name) AS user_name,
//         'RGPL' AS company_name,

//         CASE 
//           WHEN DAYOFWEEK(d.punch_date) = 1 THEN 
//             CASE
//               WHEN a.leave_status = 2 THEN 'L'
//               WHEN a.punch_in IS NULL AND a.punch_out IS NULL THEN 'WEO'
//               ELSE 
//                 CASE 
//                   WHEN h.date IS NOT NULL AND a.punch_in IS NULL AND a.punch_out IS NULL THEN 'PHY'
//                   WHEN e.state_id = 39 AND DAYOFWEEK(d.punch_date) = 7 AND h.date IS NULL AND a.punch_in IS NULL AND a.punch_out IS NULL THEN 'WEO'
//                   WHEN a.leave_status = 1 THEN 'A'
//                   WHEN a.status = 1 AND TIMESTAMPDIFF(HOUR, a.punch_in, a.punch_out) >= 8 THEN 'P'
//                   WHEN a.status = 1 AND TIMESTAMPDIFF(HOUR, a.punch_in, a.punch_out) >= 4 THEN 'ABSHD'
//                   ELSE 'A'
//                 END
//             END
//           ELSE 
//             CASE 
//               WHEN a.leave_status = 2 THEN 'L'
//               WHEN a.leave_status = 1 THEN 'A'
//               WHEN a.status = 1 AND TIMESTAMPDIFF(HOUR, a.punch_in, a.punch_out) >= 8 THEN 'P'
//               WHEN a.status = 1 AND TIMESTAMPDIFF(HOUR, a.punch_in, a.punch_out) >= 4 THEN 'ABSHD'
//               ELSE 'A'
//             END
//         END AS attendance_status,

//         -- ✅ Updated leave_type logic
//         COALESCE((
//           SELECT lsub.leave_type 
//           FROM romsondb.cor_leave_m lsub
//           WHERE lsub.emp_id = e.emp_id
//             AND DATE(lsub.enter_date) = d.punch_date
//             AND lsub.status = 2
//           ORDER BY lsub.start_date ASC
//           LIMIT 1
//         ), '0') AS leave_type,

//         CASE 
//           WHEN a.leave_status = 2 THEN DATE_FORMAT(l.enter_date, '%Y-%m-%d')
//           ELSE NULL
//         END AS applied_date,

//         CASE 
//           WHEN a.leave_status = 2 THEN d.punch_date
//           WHEN EXISTS (
//             SELECT 1 FROM romsondb.cor_leave_m lsub
//             WHERE lsub.emp_id = e.emp_id
//               AND DATE(lsub.enter_date) = d.punch_date
//               AND lsub.status = 2
//           ) THEN (
//             SELECT MIN(lsub.start_date) FROM romsondb.cor_leave_m lsub
//             WHERE lsub.emp_id = e.emp_id
//               AND DATE(lsub.enter_date) = d.punch_date
//               AND lsub.status = 2
//           )
//           ELSE NULL
//         END AS leave_transaction_date,

//         -- ✅ Regularization Columns (final)
//         COALESCE(r.status_text, '') AS regu_status,
//         COALESCE(DATE_FORMAT(r.approved_date, '%Y-%m-%d'), NULL) AS regu_approved,
//         COALESCE(DATE_FORMAT(r.Request_date, '%Y-%m-%d'), NULL) AS requested_date,

//         IF(a.status = 1 AND a.punch_in IS NOT NULL AND a.punch_out IS NOT NULL,
//           TIMESTAMPDIFF(HOUR, a.punch_in, a.punch_out),
//           0
//         ) AS total_hours

//       FROM (SELECT ? AS punch_date) d
//       LEFT JOIN romsondb.cor_emp_m e ON 1 = 1
//       LEFT JOIN romsondb.cor_attendance_m a 
//         ON e.emp_id = a.emp_id AND a.punch_date = d.punch_date
//       LEFT JOIN romsondb.cor_leave_m l 
//         ON e.emp_id = l.emp_id 
//         AND l.start_date <= d.punch_date 
//         AND (l.end_date >= d.punch_date OR l.end_date IS NULL)
//       LEFT JOIN romsondb.cor_holiday_m h 
//         ON FIND_IN_SET(e.state_id, h.state_id) > 0
//         AND h.date = d.punch_date

//       -- ✅ Join regularization table
//       LEFT JOIN (
//     SELECT 
//       enter_by,
//       Request_date,
//       Approved_date,
//       CASE WHEN status = 'A' THEN 'P' ELSE '' END AS status_text
//     FROM romsondb.cor_regulization_m
// ) r 
// ON e.emp_id = r.enter_by 
// AND DATE(r.Approved_date) = d.punch_date  -- ✅ only date comparison
// WHERE e.status = 'A'

//     `;

//     if (empId) {
//       query += ` AND e.emp_id = ?`;
//     }

//     const queryParams = empId ? [punchDate, empId] : [punchDate];

//     sql.query(query, queryParams, (err, res) => {
//       if (err) {
//         console.error("Query Error: ", err);
//         result({ error: true, message: "Failed to fetch attendance data" });
//         return;
//       }

//       const convertedResults = res
//         .filter(record => !['11000011', '11000010', '11000102'].includes(String(record.emp_id)))
//         .map(record => {
//           if (record.punch_in_time !== '00:00:00') {
//             record.punch_in_time = moment
//               .tz(record.punch_in_time, 'HH:mm:ss', 'GMT')
//               .tz('Asia/Kolkata')
//               .format('h:mm A');
//           }

//           if (record.punch_out_time !== '00:00:00') {
//             record.punch_out_time = moment
//               .tz(record.punch_out_time, 'HH:mm:ss', 'GMT')
//               .tz('Asia/Kolkata')
//               .format('h:mm A');
//           }

//           // Format total_hours as HH:MM
//           if (
//             record.punch_in_time !== '00:00:00' &&
//             record.punch_out_time !== '00:00:00'
//           ) {
//             const punchInMoment = moment(record.punch_in_time, 'h:mm A');
//             const punchOutMoment = moment(record.punch_out_time, 'h:mm A');
//             const duration = moment.duration(punchOutMoment.diff(punchInMoment));
//             const totalHours = Math.floor(duration.asHours());
//             const totalMinutes = duration.minutes();
//             record.total_hours = `${totalHours.toString().padStart(2, '0')}:${totalMinutes
//               .toString()
//               .padStart(2, '0')}`;
//           } else {
//             record.total_hours = '00:00';
//           }

//           // Generate fake attendance_id if null
//           if (!record.attendance_id) {
//             const fixedPrefix = '100';
//             const uniqueKey = `${record.emp_id}-${record.punch_date}`;
//             const hash = crypto.createHash('sha256')
//               .update(uniqueKey)
//               .digest('hex');
//             const uniqueSuffix = Math.abs(parseInt(hash.slice(-5), 16)) % 100000;
//             record.attendance_id = `${fixedPrefix}${String(uniqueSuffix).padStart(5, '0')}`;
//           }

//           return record;
//         });

//       result({ error: false, data: convertedResults });
//     });
//   } else {
//     result({ error: true, message: "Unauthorized access" });
//   }
// };

// attendance.attandance_count = (req, result) => {
//   const punchDate = req.query.punch_date;
//   const empId = req.query.emp_id;
//   const user = JSON.parse(req.headers.authorization);

//   if (user.role === 1) {
//     // ✅ First: Get Attendance Records
//     let attendanceQuery = `
//       SELECT 
//         IFNULL(a.attendance_id, NULL) AS attendance_id,
//         d.punch_date,
//         COALESCE(TIME(a.punch_in), '00:00:00') AS punch_in_time,
//         COALESCE(TIME(a.punch_out), '00:00:00') AS punch_out_time,
//         e.emp_id,
//         TRIM(e.emp_code) AS emp_code,
//         TRIM(e.user_name) AS user_name,
//         'RGPL' AS company_name,

//         CASE 
//           WHEN DAYOFWEEK(d.punch_date) = 1 THEN 
//             CASE
//               WHEN a.leave_status = 2 THEN 'L'
//               WHEN a.punch_in IS NULL AND a.punch_out IS NULL THEN 'WEO'
//               ELSE 
//                 CASE 
//                   WHEN h.date IS NOT NULL AND a.punch_in IS NULL AND a.punch_out IS NULL THEN 'PHY'
//                   WHEN e.state_id = 39 AND DAYOFWEEK(d.punch_date) = 7 AND h.date IS NULL AND a.punch_in IS NULL AND a.punch_out IS NULL THEN 'WEO'
//                   WHEN a.leave_status = 1 THEN 'A'
//                   WHEN a.status = 1 AND TIMESTAMPDIFF(HOUR, a.punch_in, a.punch_out) >= 8 THEN 'P'
//                   WHEN a.status = 1 AND TIMESTAMPDIFF(HOUR, a.punch_in, a.punch_out) >= 4 THEN 'ABSHD'
//                   ELSE 'A'
//                 END
//             END
//           ELSE 
//             CASE 
//               WHEN a.leave_status = 2 THEN 'L'
//               WHEN a.leave_status = 1 THEN 'A'
//               WHEN a.status = 1 AND TIMESTAMPDIFF(HOUR, a.punch_in, a.punch_out) >= 8 THEN 'P'
//               WHEN a.status = 1 AND TIMESTAMPDIFF(HOUR, a.punch_in, a.punch_out) >= 4 THEN 'ABSHD'
//               ELSE 'A'
//             END
//         END AS attendance_status,

//         COALESCE((
//           SELECT lsub.leave_type 
//           FROM romsondb.cor_leave_m lsub
//           WHERE lsub.emp_id = e.emp_id
//             AND DATE(lsub.enter_date) = d.punch_date
//             AND lsub.status = 2
//           ORDER BY lsub.start_date ASC
//           LIMIT 1
//         ), '0') AS leave_type,

//         CASE 
//           WHEN a.leave_status = 2 THEN DATE_FORMAT(l.enter_date, '%Y-%m-%d')
//           ELSE NULL
//         END AS applied_date,

//         CASE 
//           WHEN a.leave_status = 2 THEN d.punch_date
//           WHEN EXISTS (
//             SELECT 1 FROM romsondb.cor_leave_m lsub
//             WHERE lsub.emp_id = e.emp_id
//               AND DATE(lsub.enter_date) = d.punch_date
//               AND lsub.status = 2
//           ) THEN (
//             SELECT MIN(lsub.start_date) FROM romsondb.cor_leave_m lsub
//             WHERE lsub.emp_id = e.emp_id
//               AND DATE(lsub.enter_date) = d.punch_date
//               AND lsub.status = 2
//           )
//           ELSE NULL
//         END AS leave_transaction_date,

//         '' AS regu_status,
//         NULL AS regu_approved,
//         NULL AS requested_date,

//         IF(a.status = 1 AND a.punch_in IS NOT NULL AND a.punch_out IS NOT NULL,
//           TIMESTAMPDIFF(HOUR, a.punch_in, a.punch_out),
//           0
//         ) AS total_hours

//       FROM (SELECT ? AS punch_date) d
//       LEFT JOIN romsondb.cor_emp_m e ON 1 = 1
//       LEFT JOIN romsondb.cor_attendance_m a 
//         ON e.emp_id = a.emp_id AND a.punch_date = d.punch_date
//       LEFT JOIN romsondb.cor_leave_m l 
//         ON e.emp_id = l.emp_id 
//         AND l.start_date <= d.punch_date 
//         AND (l.end_date >= d.punch_date OR l.end_date IS NULL)
//       LEFT JOIN romsondb.cor_holiday_m h 
//         ON FIND_IN_SET(e.state_id, h.state_id) > 0
//         AND h.date = d.punch_date
//       WHERE e.status = 'A'
//     `;

//     // ✅ Second: Regularization Query (modified)
//     let regularizationQuery = `
//     SELECT 
//       NULL AS attendance_id,  -- ✅ Yahaan NULL set karo taki baad mein generate ho
//       DATE_FORMAT(r.Request_date, '%Y-%m-%d') AS punch_date,
//       '09:30:00' AS punch_in_time,
//       '17:30:00' AS punch_out_time,
//       e.emp_id,
//       TRIM(e.emp_code) AS emp_code,
//       TRIM(e.user_name) AS user_name,
//       'RGPL' AS company_name,
//       CASE WHEN r.status = 'A' THEN 'P' ELSE '' END AS regu_status,
//       DATE_FORMAT(r.Approved_date, '%Y-%m-%d') AS regu_approved,
//       DATE_FORMAT(r.Request_date, '%Y-%m-%d') AS regu_transaction_date,
//       '08:00' AS total_hours,
//       'regularization' AS record_type  -- ✅ Identifier add karo

//     FROM romsondb.cor_regulization_m r
//     INNER JOIN romsondb.cor_emp_m e 
//       ON r.enter_by = e.emp_id
//     LEFT JOIN romsondb.cor_attendance_m a 
//       ON e.emp_id = a.emp_id 
//       AND DATE(a.punch_date) = DATE(r.Approved_date)
//     WHERE DATE(r.Approved_date) = ?
//       AND e.status = 'A'
//       AND r.status = 'A'
//   `;

//     if (empId) {
//       attendanceQuery += ` AND e.emp_id = ?`;
//       regularizationQuery += ` AND e.emp_id = ?`;
//     }

//     const attendanceParams = empId ? [punchDate, empId] : [punchDate];
//     const regularizationParams = empId ? [punchDate, empId] : [punchDate];

//     // ✅ Execute both queries
//     Promise.all([
//       new Promise((resolve, reject) => {
//         sql.query(attendanceQuery, attendanceParams, (err, res) => {
//           if (err) reject(err);
//           else resolve(res);
//         });
//       }),
//       new Promise((resolve, reject) => {
//         sql.query(regularizationQuery, regularizationParams, (err, res) => {
//           if (err) reject(err);
//           else resolve(res);
//         });
//       })
//     ])
//       .then(([attendanceResults, regularizationResults]) => {
//         const allResults = [...attendanceResults, ...regularizationResults];

//         const convertedResults = allResults
//           .filter(record => !['11000011', '11000010', '11000102'].includes(String(record.emp_id)))
//           .map(record => {

//             // ✅ Har record ke liye attendance_id generate karo
//             const generateAttendanceId = (empId, punchDate, suffix = '') => {
//               const fixedPrefix = '100';
//               const uniqueKey = `${empId}-${punchDate}${suffix}`;
//               const hash = crypto.createHash('sha256').update(uniqueKey).digest('hex');
//               const uniqueSuffix = Math.abs(parseInt(hash.slice(-5), 16)) % 100000;
//               return `${fixedPrefix}${String(uniqueSuffix).padStart(5, '0')}`;
//             };

//             // ✅ Attendance ID generate karo based on record type
//             if (!record.attendance_id || record.record_type === 'regularization') {
//               const suffix = record.record_type === 'regularization' ? '-REG' : '';
//               record.attendance_id = generateAttendanceId(record.emp_id, record.punch_date, suffix);
//             }

//             if (record.regu_status === 'P') {
//               // ✅ Regularization ke liye fixed time
//               record.punch_in_time = '9:30 AM';
//               record.punch_out_time = '5:30 PM';
//               record.total_hours = '08:00';
//             } else {
//               // ✅ Normal attendance ke liye time conversion
//               if (record.punch_in_time !== '00:00:00') {
//                 record.punch_in_time = moment
//                   .tz(record.punch_in_time, 'HH:mm:ss', 'GMT')
//                   .tz('Asia/Kolkata')
//                   .format('h:mm A');
//               }

//               if (record.punch_out_time !== '00:00:00') {
//                 record.punch_out_time = moment
//                   .tz(record.punch_out_time, 'HH:mm:ss', 'GMT')
//                   .tz('Asia/Kolkata')
//                   .format('h:mm A');
//               }

//               // Format total_hours
//               if (record.punch_in_time !== '00:00:00' && record.punch_out_time !== '00:00:00') {
//                 const punchInMoment = moment(record.punch_in_time, 'h:mm A');
//                 const punchOutMoment = moment(record.punch_out_time, 'h:mm A');
//                 const duration = moment.duration(punchOutMoment.diff(punchInMoment));
//                 const totalHours = Math.floor(duration.asHours());
//                 const totalMinutes = duration.minutes();
//                 record.total_hours = `${totalHours.toString().padStart(2, '0')}:${totalMinutes
//                   .toString()
//                   .padStart(2, '0')}`;
//               } else {
//                 record.total_hours = '00:00';
//               }
//             }

//             // ✅ Extra fields remove karo
//             delete record.regu_status;
//             delete record.regu_approved;
//             delete record.requested_date;
//             delete record.regu_transaction_date;
//             delete record.leave_transaction_date;
//             delete record.record_type;

//             return record;
//           });

//         result({ error: false, data: convertedResults });
//       })
//       .catch(err => {
//         console.error("Query Error: ", err);
//         result({ error: true, message: "Failed to fetch attendance data" });
//       });

//   } else {
//     result({ error: true, message: "Unauthorized access" });
//   }
// };


attendance.attandance_count = (req, result) => {
  const punchDate = req.query.punch_date;
  const empId = req.query.emp_id;
  const user = JSON.parse(req.headers.authorization);

  if (user.role === 1) {
    // ✅ 1️⃣ Attendance Query
    let attendanceQuery = `
     SELECT DISTINCT 
  IFNULL(a.attendance_id, NULL) AS attendance_id,
  d.punch_date,
  COALESCE(TIME(a.punch_in), '00:00:00') AS punch_in_time,
  COALESCE(TIME(a.punch_out), '00:00:00') AS punch_out_time,
  e.emp_id,
  TRIM(e.emp_code) AS emp_code,
  TRIM(e.user_name) AS user_name,
  'RGPL' AS company_name,

  CASE 
    WHEN h.date IS NOT NULL AND a.punch_in IS NULL AND a.punch_out IS NULL THEN 'PHY' -- ✅ Show holiday first (any day)
    WHEN a.leave_status = 2 THEN 'L'
    WHEN a.leave_status = 1 THEN 'A'
    WHEN DAYOFWEEK(d.punch_date) = 1 THEN 'WEO' -- Sunday
    WHEN e.state_id = 39 AND DAYOFWEEK(d.punch_date) = 7 AND a.punch_in IS NULL AND a.punch_out IS NULL THEN 'WEO' -- Saturday off (for state 39)
    WHEN a.status = 1 AND TIMESTAMPDIFF(HOUR, a.punch_in, a.punch_out) >= 8 THEN 'P'
    WHEN a.status = 1 AND TIMESTAMPDIFF(HOUR, a.punch_in, a.punch_out) >= 4 THEN 'ABSHD'
    ELSE 'A'
  END AS attendance_status,

  COALESCE((
    SELECT lsub.leave_type 
    FROM romsondb.cor_leave_m lsub
    WHERE lsub.emp_id = e.emp_id
      AND DATE(lsub.enter_date) = d.punch_date
      AND lsub.status = 2
    ORDER BY lsub.start_date ASC
    LIMIT 1
  ), '0') AS leave_type,

  CASE 
    WHEN a.leave_status = 2 THEN DATE_FORMAT(l.enter_date, '%Y-%m-%d')
    ELSE NULL
  END AS applied_date,

  CASE 
    WHEN a.leave_status = 2 THEN d.punch_date
    WHEN EXISTS (
      SELECT 1 FROM romsondb.cor_leave_m lsub
      WHERE lsub.emp_id = e.emp_id
        AND DATE(lsub.enter_date) = d.punch_date
        AND lsub.status = 2
    ) THEN (
      SELECT MIN(lsub.start_date) FROM romsondb.cor_leave_m lsub
      WHERE lsub.emp_id = e.emp_id
        AND DATE(lsub.enter_date) = d.punch_date
        AND lsub.status = 2
    )
    ELSE NULL
  END AS leave_transaction_date,

  '' AS regu_status,
  NULL AS regu_approved,
  NULL AS requested_date,

  IF(a.status = 1 AND a.punch_in IS NOT NULL AND a.punch_out IS NOT NULL,
    TIMESTAMPDIFF(HOUR, a.punch_in, a.punch_out),
    0
  ) AS total_hours,

  'attendance' AS record_type

FROM (SELECT ? AS punch_date) d
LEFT JOIN romsondb.cor_emp_m e ON 1 = 1
LEFT JOIN romsondb.cor_attendance_m a 
  ON e.emp_id = a.emp_id AND a.punch_date = d.punch_date
LEFT JOIN romsondb.cor_leave_m l 
  ON e.emp_id = l.emp_id 
  AND l.start_date <= d.punch_date 
  AND (l.end_date >= d.punch_date OR l.end_date IS NULL)
LEFT JOIN romsondb.cor_holiday_m h 
  ON FIND_IN_SET(e.state_id, h.state_id) > 0
  AND h.date = d.punch_date
WHERE e.status = 'A'

    `;

    // ✅ 2️⃣ Regularization Query
    let regularizationQuery = `
      SELECT 
        NULL AS attendance_id,
        DATE_FORMAT(r.Request_date, '%Y-%m-%d') AS punch_date,
        '09:30:00' AS punch_in_time,
        '17:30:00' AS punch_out_time,
        e.emp_id,
        TRIM(e.emp_code) AS emp_code,
        TRIM(e.user_name) AS user_name,
        'RGPL' AS company_name,
        CASE WHEN r.status = 'A' THEN 'P' ELSE '' END AS regu_status,
        DATE_FORMAT(r.Approved_date, '%Y-%m-%d') AS regu_approved,
        DATE_FORMAT(r.Request_date, '%Y-%m-%d') AS regu_transaction_date,
        '08:00' AS total_hours,
        'regularization' AS record_type
      FROM romsondb.cor_regulization_m r
      INNER JOIN romsondb.cor_emp_m e ON r.enter_by = e.emp_id
      WHERE DATE(r.Approved_date) = ?
        AND e.status = 'A'
        AND r.status = 'A'
    `;

    // ✅ 3️⃣ Leave Query (full range)
    let leaveQuery = `
      SELECT 
        NULL AS attendance_id,
        DATE_FORMAT(l.start_date + INTERVAL seqs.seq DAY, '%Y-%m-%d') AS punch_date,
        DATE_FORMAT(l.start_date + INTERVAL seqs.seq DAY, '%Y-%m-%d') AS leave_transaction_date,
        DATE_FORMAT(l.Approved_date, '%Y-%m-%d') AS approved_date,
        l.leave_type,
        e.emp_id,
        TRIM(e.emp_code) AS emp_code,
        TRIM(e.user_name) AS user_name,
        'RGPL' AS company_name,
        'leave' AS record_type,
                CASE WHEN l.status = 2 THEN 'L' ELSE '' END AS attendance_status

      FROM romsondb.cor_leave_m l
      INNER JOIN romsondb.cor_emp_m e ON l.emp_id = e.emp_id
      JOIN (
        SELECT 0 AS seq UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
        UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
        UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14
        UNION ALL SELECT 15 UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19
        UNION ALL SELECT 20 UNION ALL SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23 UNION ALL SELECT 24
        UNION ALL SELECT 25 UNION ALL SELECT 26 UNION ALL SELECT 27 UNION ALL SELECT 28 UNION ALL SELECT 29
      ) seqs
        ON DATE(l.start_date + INTERVAL seqs.seq DAY) <= DATE(l.end_date)
      WHERE DATE(l.Approved_date) = ?
        AND l.status = 2
        AND e.status = 'A'
    `;

    if (empId) {
      attendanceQuery += ` AND e.emp_id = ?`;
      regularizationQuery += ` AND e.emp_id = ?`;
      leaveQuery += ` AND e.emp_id = ?`;
    }

    const attendanceParams = empId ? [punchDate, empId] : [punchDate];
    const regularizationParams = empId ? [punchDate, empId] : [punchDate];
    const leaveParams = empId ? [punchDate, empId] : [punchDate];

    Promise.all([
      new Promise((resolve, reject) => sql.query(attendanceQuery, attendanceParams, (err, res) => err ? reject(err) : resolve(res))),
      new Promise((resolve, reject) => sql.query(regularizationQuery, regularizationParams, (err, res) => err ? reject(err) : resolve(res))),
      new Promise((resolve, reject) => sql.query(leaveQuery, leaveParams, (err, res) => err ? reject(err) : resolve(res)))
    ])
      .then(([attendanceResults, regularizationResults, leaveResults]) => {
        const allResults = [...attendanceResults, ...regularizationResults, ...leaveResults];

        // ✅ Filter step: if both attendance/regularization and leave exist, keep only leave
        const filteredResults = allResults.filter((record, _, self) => {
          const hasLeave = self.some(
            r => r.emp_id === record.emp_id &&
                 r.punch_date === record.punch_date &&
                 r.record_type === 'leave'
          );
          if (record.record_type !== 'leave' && hasLeave) return false;
          return true;
        });

        const convertedResults = filteredResults
          .filter(r => !['11000011', '11000010', '11000102'].includes(String(r.emp_id)))
          .map(record => {
            const generateAttendanceId = (empId, punchDate, suffix = '') => {
              const fixedPrefix = '100';
              const uniqueKey = `${empId}-${punchDate}${suffix}`;
              const hash = crypto.createHash('sha256').update(uniqueKey).digest('hex');
              const uniqueSuffix = Math.abs(parseInt(hash.slice(-5), 16)) % 100000;
              return `${fixedPrefix}${String(uniqueSuffix).padStart(5, '0')}`;
            };

            if (!record.attendance_id) {
              const suffix = record.record_type === 'regularization'
                ? '-REG'
                : record.record_type === 'leave'
                ? '-LEV'
                : '';
              record.attendance_id = generateAttendanceId(record.emp_id, record.punch_date, suffix);
            }

            if (record.regu_status === 'P') {
              record.punch_in_time = '9:30 AM';
              record.punch_out_time = '5:30 PM';
              record.total_hours = '08:00';
            } else if (record.record_type !== 'leave') {
              if (record.punch_in_time !== '00:00:00') {
                record.punch_in_time = moment
                  .tz(record.punch_in_time, 'HH:mm:ss', 'GMT')
                  .tz('Asia/Kolkata')
                  .format('h:mm A');
              }
              if (record.punch_out_time !== '00:00:00') {
                record.punch_out_time = moment
                  .tz(record.punch_out_time, 'HH:mm:ss', 'GMT')
                  .tz('Asia/Kolkata')
                  .format('h:mm A');
              }
            }

            if (record.record_type !== 'regularization') {
              delete record.regu_status;
              delete record.regu_approved;
              delete record.regu_transaction_date;
            }
            delete record.requested_date;
            delete record.record_type;

            return record;
          });

        result({ error: false, data: convertedResults });
      })
      .catch(err => {
        console.error('Query Error: ', err);
        result({ error: true, message: 'Failed to fetch attendance data' });
      });
  } else {
    result({ error: true, message: 'Unauthorized access' });
  }
};


/////////////////////for crm_report////////////////////////////////////
attendance.attendance_monthly = (req, result) => {
  const month = req.query.month;
  const year = req.query.year || new Date().getFullYear();
  const user = JSON.parse(req.headers.authorization);

  if (user.role === 1) {
    const daysInMonth = new Date(year, month, 0).getDate();
    const dateArray = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const day = i.toString().padStart(2, '0');
      dateArray.push(`${year}-${month}-${day}`);
    }

    const dateUnion = dateArray.map(date => `SELECT '${date}' AS punch_date`).join(' UNION ALL ');

    const query = `
WITH calendar_dates AS (
  ${dateUnion}
)
SELECT 
  d.punch_date,
  e.emp_id,
  TRIM(e.emp_code) AS emp_code,
  TRIM(e.user_name) AS user_name,
  dsg.designation_name,
  MAX(l.leave_type) AS leave_type,
  CASE
      WHEN d.punch_date > CURRENT_DATE() OR (e.deleted_at IS NOT NULL AND d.punch_date > e.deleted_at) THEN ''
          WHEN MAX(a.leave_status) = 2 AND MAX(l.leave_type) = 'LOP' THEN 'LOP'
    WHEN MAX(a.leave_status) = 2 THEN 'L'
    WHEN l.status = 1 THEN 'PL'
    WHEN MAX(h.date IS NOT NULL) AND MAX(a.punch_in IS NULL AND a.punch_out IS NULL) THEN 'PHY'
    WHEN e.state_id = 39 AND DAYOFWEEK(d.punch_date) = 7 AND MAX(h.date) IS NULL AND MAX(a.punch_in) IS NULL AND MAX(a.punch_out) IS NULL THEN 'WEO'
    WHEN DAYOFWEEK(d.punch_date) = 1 AND MAX(a.punch_in) IS NULL AND MAX(a.punch_out) IS NULL THEN 'WEO'
    WHEN MAX(a.punch_in) IS NULL AND MAX(a.punch_out) IS NULL AND d.punch_date <= CURRENT_DATE() THEN 'A'
        WHEN a.punch_in IS NOT NULL 
         AND TIME(CONVERT_TZ(a.punch_in, '+00:00', '+05:30')) >= '10:31:00' THEN 'ABSHD'

        WHEN MAX(a.status) = 1 AND MAX(a.punch_in) IS NOT NULL AND MAX(a.punch_out) IS NOT NULL THEN 'P'
     WHEN a.punch_in IS NOT NULL AND a.punch_out IS NULL AND TIME(CONVERT_TZ(a.punch_in, '+00:00', '+05:30')) <= '10:30:59' THEN 'P'

    WHEN d.punch_date > CURRENT_DATE() THEN ''
    ELSE 'A'
  END AS attendance_status,
CASE WHEN MAX(r.Regular_id) IS NOT NULL THEN 1 ELSE 0 END AS regularized
FROM calendar_dates d
CROSS JOIN romsondb.cor_emp_m e
LEFT JOIN romsondb.cor_attendance_m a 
  ON e.emp_id = a.emp_id AND a.punch_date = d.punch_date
LEFT JOIN romsondb.cor_leave_m l 
  ON e.emp_id = l.emp_id 
  AND l.start_date <= d.punch_date 
  AND (l.end_date >= d.punch_date OR l.end_date IS NULL)
LEFT JOIN romsondb.cor_holiday_m h 
  ON FIND_IN_SET(e.state_id, h.state_id) > 0
  AND h.date = d.punch_date
LEFT JOIN romsondb.cor_designation_m dsg 
  ON e.designation = dsg.designation_id
  LEFT JOIN romsondb.cor_regulization_m r
  ON r.enter_by = e.emp_id
  AND r.request_date = d.punch_date
  AND r.status = 'A'
WHERE (e.user_locked_date IS NULL OR e.user_locked_date <= d.punch_date)
AND (e.deleted_at IS NULL OR e.deleted_at >= d.punch_date)
GROUP BY e.emp_id, d.punch_date
ORDER BY e.emp_id, d.punch_date

    `;

    sql.query(query, (err, res) => {
      if (err) {
        console.error("Query Error: ", err);
        result({ error: true, message: "Failed to fetch monthly attendance data" });
        return;
      }

      const finalOutput = [];
      const employeeMap = {};

      for (const row of res) {
        const empId = row.emp_id;
        const day = new Date(row.punch_date).getDate();
        const status = row.attendance_status;
        const leaveType = row.leave_type ? row.leave_type.toUpperCase() : null; // ← declare here


        if (!employeeMap[empId]) {
          employeeMap[empId] = {
            emp_id: empId,
            emp_code: row.emp_code,
            user_name: row.user_name,
            designation: row.designation_name,
            present_days: 0,
            half_days: 0,
            leave: 0,
            holiday: 0,
            absent: 0,
            weo: 0,
            lop_days: 0,
            ml_days: 0,
            total_working_days: 0,
            month_days: daysInMonth,
            pending_leave: 0,
            regularized_present: 0
          };
        }

        if (leaveType === 'ML') {
          // ML-specific logic
          for (let i = 1; i <= daysInMonth; i++) {
            employeeMap[empId][i] = 'ML';
          }
          employeeMap[empId].total_working_days = 0;
          employeeMap[empId].ml_days = daysInMonth;
          continue; // skip normal processing
        }


        employeeMap[empId][day] = status;

        // Accurate count only on valid working status
        // Count attendance types

        // const leaveType = row.leave_type;

        // Track leave types properly
        if (!employeeMap[empId].leave) {
          employeeMap[empId].leave = { EL: 0, SL: 0, CL: 0, TOTAL: 0 };
        }

        if (status === 'P') {
          employeeMap[empId].present_days += 1;
          employeeMap[empId].total_working_days += 1;
          if (row.regularized === 1) {
            employeeMap[empId].regularized_present += 1;
            employeeMap[empId][day] = 'P*';
          } else {
            employeeMap[empId][day] = 'P';
          }
        } else if (status === 'ABSHD') {
          employeeMap[empId].half_days += 0.5;
          employeeMap[empId].total_working_days += 0.5;
        } else if (status === 'L') {

          const leaveLabel = leaveType ? leaveType.toUpperCase() : null;
          if (['EL', 'CL', 'SL'].includes(leaveLabel)) {
            employeeMap[empId][day] = leaveLabel;
            employeeMap[empId].leave[leaveLabel] += 1;
            employeeMap[empId].leave.TOTAL += 1;
            employeeMap[empId].total_working_days += 1;
          } else {
            employeeMap[empId][day] = 'L'; // fallback
          }
        } else if (status === 'LOP') {  // ✅ Add here
          employeeMap[empId][day] = 'LOP';
          employeeMap[empId].lop_days += 1;
          // employeeMap[empId].total_working_days += 1;
        } else if (status === 'PL') {
          // Pending leave
          employeeMap[empId].pending_leave += 1;
          employeeMap[empId][day] = 'PL';

        } else if (status === 'PHY') {
          employeeMap[empId].holiday += 1;
          employeeMap[empId].total_working_days += 1;
        } else if (status === 'A') {
          employeeMap[empId].absent += 1;
        } else if (status === 'WEO') {
          employeeMap[empId].weo += 1;
          employeeMap[empId].total_working_days += 1;
        }
      }

      // Fill missing days
      for (const empId in employeeMap) {
        for (let i = 1; i <= daysInMonth; i++) {
          if (!employeeMap[empId][i]) {
            employeeMap[empId][i] = '';
          }
        }
        finalOutput.push(employeeMap[empId]);
      }

      result({ error: false, data: finalOutput });
    });
  } else {
    result({ error: true, message: "Unauthorized access" });
  }
};

attendance.punchInOutTime = (req, result) => {
  sql.query(`
    SELECT 
      DATE_FORMAT(CONVERT_TZ(punch_in, '+00:00', '+05:30'), '%h:%i %p') AS punch_in,
      DATE_FORMAT(CONVERT_TZ(punch_out, '+00:00', '+05:30'), '%h:%i %p') AS punch_out,
      TIMESTAMPDIFF(HOUR, punch_in, punch_out) AS total_hours
    FROM romsondb.cor_attendance_m 
    WHERE emp_id = '${req.body.empidd}' 
    AND (
      DATE(CONVERT_TZ(punch_in, '+00:00', '+05:30')) = DATE(CONVERT_TZ(NOW(), '+00:00', '+05:30'))
      OR DATE(CONVERT_TZ(punch_out, '+00:00', '+05:30')) = DATE(CONVERT_TZ(NOW(), '+00:00', '+05:30'))
    ) and punch_date = '2025-07-26';
  `, (err, res) => {

    console.log("Result Data: ", res);

    if (err) {
      result({ error: true, data: "Something Went Wrong" });
    } else {
      result({ error: false, data: res });
    }
  });
};

attendance.shiftDetails = (req, result) => {
  sql.query(`
    SELECT 
    DATE_FORMAT(start_time, '%h:%i %p') AS start_time,
    DATE_FORMAT(end_time, '%h:%i %p') AS end_time,
    DATE_FORMAT(grace_start_time, '%h:%i %p') AS grace_start_time,
    DATE_FORMAT(grace_end_time, '%h:%i %p') AS grace_end_time,
    DATE_FORMAT(late_start_coming, '%h:%i %p') AS late_start_coming,
    DATE_FORMAT(late_end_coming, '%h:%i %p') AS late_end_coming
FROM 
    romsondb.cor_shift_m;
  `, (err, res) => {

    console.log("Result Data: ", res);

    if (err) {
      result({ error: true, data: "Something Went Wrong" });
    } else {
      result({ error: false, data: res });
    }
  });
};

attendance.attandance_summary = (req, result) => {
  const empId = req.query.emp_id; // Employee ID parameter


  const query = `
    SELECT 
      DATE_FORMAT(CONVERT_TZ(punch_in, '+00:00', '+05:30'), '%l:%i %p') AS punch_in_time,  -- punch_in in AM/PM format
      DATE_FORMAT(CONVERT_TZ(punch_out, '+00:00', '+05:30'), '%l:%i %p') AS punch_out_time,  -- punch_out in AM/PM format
      TIMESTAMPDIFF(HOUR, 
        CONVERT_TZ(punch_in, '+00:00', '+05:30'), 
        CONVERT_TZ(punch_out, '+00:00', '+05:30')
      ) AS total_hours -- Total hours worked
    FROM 
      romsondb.cor_attendance_m
    WHERE 
      emp_id = ?
      AND DATE(CONVERT_TZ(punch_in, '+00:00', '+05:30')) = CURDATE()
      AND punch_in IS NOT NULL 
      AND punch_out IS NOT NULL;
  `;

  // Execute the query
  sql.query(query, [empId], (err, res) => {
    if (err) {
      console.error("Query Error: ", err);
      result({ error: true, data: "Something Went Wrong" });
    } else {
      result({
        error: false,
        data: res
      });
    }
  });
};

attendance.leave_history = (req, result) => {
  const empId = req.query.emp_id; // Employee ID parameter (optional)
  console.log(empId, "[]]]]]]]]]]");

  // Base query to fetch leave details
  let query = `
   SELECT 
    sm.emp_id,
    
    -- CL Leave Details
    COALESCE(SUM(CASE WHEN lm.leave_type = 'CL' THEN lm.leave_days ELSE 0 END), 0) AS cl_availed,
    COALESCE(MAX(CASE WHEN sm.leave_type = 'CL' THEN sm.leave_count ELSE 0 END), 0) AS cl_allocated,
    GREATEST(
        COALESCE(MAX(CASE WHEN sm.leave_type = 'CL' THEN sm.leave_count ELSE 0 END), 0) - 
        COALESCE(SUM(CASE WHEN lm.leave_type = 'CL' THEN lm.leave_days ELSE 0 END), 0),
        0
    ) AS cl_balance,
    
    -- EL Leave Details
    COALESCE(SUM(CASE WHEN lm.leave_type = 'EL' THEN lm.leave_days ELSE 0 END), 0) AS el_availed,
    COALESCE(MAX(CASE WHEN sm.leave_type = 'EL' THEN sm.leave_count ELSE 0 END), 0) AS el_allocated,
    GREATEST(
        COALESCE(MAX(CASE WHEN sm.leave_type = 'EL' THEN sm.leave_count ELSE 0 END), 0) - 
        COALESCE(SUM(CASE WHEN lm.leave_type = 'EL' THEN lm.leave_days ELSE 0 END), 0),
        0
    ) AS el_balance,
    
    -- SL Leave Details (Added SL Logic)
    COALESCE(SUM(CASE WHEN lm.leave_type = 'SL' THEN lm.leave_days ELSE 0 END), 0) AS sl_availed,
    COALESCE(MAX(CASE WHEN sm.leave_type = 'SL' THEN sm.leave_count ELSE 0 END), 0) AS sl_allocated,
    GREATEST(
        COALESCE(MAX(CASE WHEN sm.leave_type = 'SL' THEN sm.leave_count ELSE 0 END), 0) - 
        COALESCE(SUM(CASE WHEN lm.leave_type = 'SL' THEN lm.leave_days ELSE 0 END), 0),
        0
    ) AS sl_balance,

    -- Total Allocated Leave (Including SL)
    COALESCE(MAX(CASE WHEN sm.leave_type = 'CL' THEN sm.leave_count ELSE 0 END), 0) +
    COALESCE(MAX(CASE WHEN sm.leave_type = 'EL' THEN sm.leave_count ELSE 0 END), 0) +
    COALESCE(MAX(CASE WHEN sm.leave_type = 'SL' THEN sm.leave_count ELSE 0 END), 0) AS total_allocated_leave

FROM 
    crm_dev_db.cor_leave_summary sm
LEFT JOIN 
    crm_dev_db.cor_leave_m lm 
ON 
    sm.emp_id = lm.emp_id 
    AND sm.leave_type = lm.leave_type
    AND YEAR(lm.enter_date) = YEAR(CURRENT_DATE())  -- Filter on enter_date for current year
WHERE 
    sm.emp_id = ?
GROUP BY 
    sm.emp_id;
`;

  // Check if empId exists and pass it as a parameter
  const queryParams = [empId];

  sql.query(query, queryParams, (err, res) => {
    if (err) {
      console.error("Query Error: ", err);
      result({ error: true, data: "Something Went Wrong" });
    } else {
      result({
        error: false,
        data: res
      });
    }
  });
};


// attendance.attendance_punch_in =  (req, result) => {
//   sql.query(`SELECT COUNT(*) as count FROM romsondb.cor_attendance_m WHERE emp_id = '${req.body.empID}' AND punch_date = curdate()`,
//  (err, res) => {
//     console.log("osbss: ", res);
//     if (err) {
//       result({ error: true, data: "Something Went Wrong" })
//     }
//     console.log(res[0].count);

//   });
// };


///for select leave type

attendance.LeaveType = (req, result) => {
  sql.query(`select leave_type,leave_description from crm_dev_db.cor_leave_type`, (err, res) => {
    // console.log("osbss: ", res);
    if (err) {
      result({ error: true, data: "Something Went Wrong" })
    }
    result({ error: false, data: res })
  });
};



attendance.HolidayList = (req, result) => {
  const query = `
    SELECT 
      h.year,
      h.date,
      DAYNAME(h.date) AS day_name,  -- DAYNAME returns the correct day name for the date
      h.holiday_name,
      h.holiday_type,
      h.state_id
    FROM 
      romsondb.cor_holiday_m h
    INNER JOIN 
      romsondb.cor_emp_m e ON FIND_IN_SET(e.state_id, h.state_id) > 0
    WHERE 
      e.emp_id = '${req.body.empId}'  -- Replace dynamically with the logged-in employee ID
      AND h.year = '${req.body.year}'  -- Replace dynamically with the selected year
    ORDER BY 
      h.date;
  `;

  sql.query(query, (err, res) => {
    if (err) {
      console.error("Error executing query:", err);
      return result({ error: true, data: "Something Went Wrong" });
    }
    return result({ error: false, data: res });
  });
};

////////////////////////for crm_report//////////////////////////////
///////////////////leaveReportSummary with new table cor_leave_summary//////////////////////


// attendance.leaveReportSummary = (req, result) => {
//   const { fromDate, toDate, statusFilter } = req.body;

//   // Build status condition dynamically
//   let statusCondition = "";
//   if (statusFilter === "Pending") {
//     statusCondition = "AND lm.status = 1 AND lm.approved_by IS NULL";
//   } else if (statusFilter === "Accepted") {
//     statusCondition = "AND lm.status = 1 AND lm.approved_by IS NOT NULL";
//   } else if (statusFilter === "Rejected") {
//     statusCondition = "AND lm.status = 3";
//   }

//   const query = `
//     SELECT 
//       lm.emp_id,
//       em.user_name,
//        em.head_quater_name,
//       lm.leave_type,
//       DATE_FORMAT(lm.start_date, '%Y-%m-%d') AS start_date,
//       DATE_FORMAT(lm.end_date, '%Y-%m-%d') AS end_date,
//       CONCAT(DATE_FORMAT(lm.start_date, '%d-%b-%Y'), ' - ', DATE_FORMAT(lm.end_date, '%d-%b-%Y')) AS leave_from_to,
//       lm.leave_days,
//       lm.leave_reason,
//       CONCAT(lm.reporting_to, ' - ', r.user_name) AS reporting_to_name,
//       CONCAT(lm.approved_by, ' - ', ab.user_name) AS approved_by,
//       DATE_FORMAT(lm.approved_date, '%Y-%m-%d') AS approved_date,
//       CASE 
//         WHEN lm.status = 3 THEN 'Rejected'
//         WHEN lm.status = 2 AND lm.approved_by IS NOT NULL THEN 'Accepted'
//         WHEN lm.status = 1 AND lm.approved_by IS NULL THEN 'Pending'
//         ELSE 'Unknown'
//       END AS status,

//       (
//         COALESCE(MAX(CASE WHEN sm.leave_type = 'CL' THEN sm.leave_count ELSE 0 END), 0) +
//         COALESCE(MAX(CASE WHEN sm.leave_type = 'EL' THEN sm.leave_count ELSE 0 END), 0) +
//         COALESCE(MAX(CASE WHEN sm.leave_type = 'SL' THEN sm.leave_count ELSE 0 END), 0)
//       ) AS total_allocated_leave,

//       (
//         SELECT 
//           COALESCE(SUM(CASE WHEN lm2.leave_type = 'CL' THEN lm2.leave_days ELSE 0 END), 0) +
//           COALESCE(SUM(CASE WHEN lm2.leave_type = 'EL' THEN lm2.leave_days ELSE 0 END), 0) +
//           COALESCE(SUM(CASE WHEN lm2.leave_type = 'SL' THEN lm2.leave_days ELSE 0 END), 0)
//         FROM romsondb.cor_leave_m lm2
//         WHERE lm2.emp_id = lm.emp_id
//           AND YEAR(lm2.enter_date) = YEAR(CURDATE())
//       ) AS total_availed_leave,

//       (
//         (
//           COALESCE(MAX(CASE WHEN sm.leave_type = 'CL' THEN sm.leave_count ELSE 0 END), 0) +
//           COALESCE(MAX(CASE WHEN sm.leave_type = 'EL' THEN sm.leave_count ELSE 0 END), 0) +
//           COALESCE(MAX(CASE WHEN sm.leave_type = 'SL' THEN sm.leave_count ELSE 0 END), 0)
//         ) -
//         (
//           SELECT 
//             COALESCE(SUM(CASE WHEN lm2.leave_type = 'CL' THEN lm2.leave_days ELSE 0 END), 0) +
//             COALESCE(SUM(CASE WHEN lm2.leave_type = 'EL' THEN lm2.leave_days ELSE 0 END), 0) +
//             COALESCE(SUM(CASE WHEN lm2.leave_type = 'SL' THEN lm2.leave_days ELSE 0 END), 0)
//           FROM romsondb.cor_leave_m lm2
//           WHERE lm2.emp_id = lm.emp_id
//             AND YEAR(lm2.enter_date) = YEAR(CURDATE())
//         )
//       ) AS total_balance_leave

//     FROM romsondb.cor_leave_m lm
//     JOIN romsondb.cor_emp_m em ON em.emp_id = lm.emp_id
//     LEFT JOIN romsondb.cor_leave_summary sm ON sm.emp_id = lm.emp_id
//     LEFT JOIN romsondb.cor_emp_m r ON r.emp_id = lm.reporting_to
//     LEFT JOIN romsondb.cor_emp_m ab ON ab.emp_id = lm.approved_by

//     WHERE lm.start_date <= '${toDate}'
//       AND lm.end_date >= '${fromDate}'
//       ${statusCondition}

//     GROUP BY lm.id
//     ORDER BY lm.start_date ASC;
//   `;

//   console.log("Executing Query:", query);

//   sql.query(query, (err, res) => {
//     if (err) {
//       console.error("Query Error:", err);
//       result({ error: true, data: "Something Went Wrong" });
//     } else {
//       result({ error: false, data: res });
//     }
//   });
// };


attendance.leaveReportSummary = (req, result) => {
  const { fromDate, toDate, statusFilter } = req.body;

  // Build status condition dynamically
  let statusCondition = "";
  if (statusFilter === "Pending") {
    statusCondition = "AND lm.status = 1 AND lm.approved_by IS NULL";
  } else if (statusFilter === "Accepted") {
    statusCondition = "AND lm.status = 2 AND lm.approved_by IS NOT NULL";
  } else if (statusFilter === "Rejected") {
    statusCondition = "AND lm.status = 3";
  }

  const query = `
  SELECT 
    lm.emp_id,
    em.user_name,
    em.head_quater_name,
    lm.leave_type,
    DATE_FORMAT(lm.start_date, '%Y-%m-%d') AS start_date,
    DATE_FORMAT(lm.end_date, '%Y-%m-%d') AS end_date,
    CONCAT(DATE_FORMAT(lm.start_date, '%d-%b-%Y'), ' - ', DATE_FORMAT(lm.end_date, '%d-%b-%Y')) AS leave_from_to,
    lm.leave_days,
    lm.leave_reason,
    CONCAT(lm.reporting_to, ' - ', r.user_name) AS reporting_to_name,
    CONCAT(lm.approved_by, ' - ', ab.user_name) AS approved_by,
    DATE_FORMAT(lm.approved_date, '%Y-%m-%d') AS approved_date,

    CASE 
      WHEN lm.status = 3 THEN 'Rejected'
      WHEN lm.status = 2 AND lm.approved_by IS NOT NULL THEN 'Accepted'
      WHEN lm.status = 1 AND lm.approved_by IS NULL THEN 'Pending'
      ELSE 'Unknown'
    END AS status,

    -- Total Allocated
    COALESCE(MAX(CASE WHEN sm.leave_type = 'CL' THEN sm.leave_count END), 0) AS total_allocated_cl,
    COALESCE(MAX(CASE WHEN sm.leave_type = 'EL' THEN sm.leave_count END), 0) AS total_allocated_el,
    COALESCE(MAX(CASE WHEN sm.leave_type = 'SL' THEN sm.leave_count END), 0) AS total_allocated_sl,
    (
      COALESCE(MAX(CASE WHEN sm.leave_type = 'CL' THEN sm.leave_count END), 0) +
      COALESCE(MAX(CASE WHEN sm.leave_type = 'EL' THEN sm.leave_count END), 0) +
      COALESCE(MAX(CASE WHEN sm.leave_type = 'SL' THEN sm.leave_count END), 0)
    ) AS total_allocated_leave,

    -- Total Availed
    (
      SELECT COALESCE(SUM(lm2.leave_days), 0)
      FROM romsondb.cor_leave_m lm2
      WHERE lm2.emp_id = lm.emp_id
        AND lm2.leave_type = 'CL'
            AND lm2.start_date <= '${toDate}' AND lm2.end_date >= '${fromDate}'
    ) AS total_availed_cl,

    (
      SELECT COALESCE(SUM(lm2.leave_days), 0)
      FROM romsondb.cor_leave_m lm2
      WHERE lm2.emp_id = lm.emp_id
        AND lm2.leave_type = 'EL'
    AND lm2.start_date <= '${toDate}' AND lm2.end_date >= '${fromDate}'
    ) AS total_availed_el,

    (
      SELECT COALESCE(SUM(lm2.leave_days), 0)
      FROM romsondb.cor_leave_m lm2
      WHERE lm2.emp_id = lm.emp_id
        AND lm2.leave_type = 'SL'
            AND lm2.start_date <= '${toDate}' AND lm2.end_date >= '${fromDate}'
    ) AS total_availed_sl,

    (
      SELECT 
        COALESCE(SUM(CASE WHEN lm2.leave_type = 'CL' THEN lm2.leave_days ELSE 0 END), 0) +
        COALESCE(SUM(CASE WHEN lm2.leave_type = 'EL' THEN lm2.leave_days ELSE 0 END), 0) +
        COALESCE(SUM(CASE WHEN lm2.leave_type = 'SL' THEN lm2.leave_days ELSE 0 END), 0)
      FROM romsondb.cor_leave_m lm2
      WHERE lm2.emp_id = lm.emp_id
        AND lm2.start_date <= '${toDate}' 
    AND lm2.end_date >= '${fromDate}'
    ) AS total_availed_leave,

 -- Total Balance CL
(
  COALESCE(MAX(CASE WHEN sm.leave_type = 'CL' THEN sm.leave_count END), 0) -
  (
    SELECT COALESCE(SUM(lm2.leave_days), 0)
    FROM romsondb.cor_leave_m lm2
    WHERE lm2.emp_id = lm.emp_id
      AND YEAR(lm2.enter_date) = YEAR(CURDATE())
      AND lm2.leave_type = 'CL'
  )
) AS total_balance_cl,

-- Total Balance EL
(
  COALESCE(MAX(CASE WHEN sm.leave_type = 'EL' THEN sm.leave_count END), 0) -
  (
    SELECT COALESCE(SUM(lm2.leave_days), 0)
    FROM romsondb.cor_leave_m lm2
    WHERE lm2.emp_id = lm.emp_id
      AND YEAR(lm2.enter_date) = YEAR(CURDATE())
      AND lm2.leave_type = 'EL'
  )
) AS total_balance_el,

-- Total Balance SL
(
  COALESCE(MAX(CASE WHEN sm.leave_type = 'SL' THEN sm.leave_count END), 0) -
  (
    SELECT COALESCE(SUM(lm2.leave_days), 0)
    FROM romsondb.cor_leave_m lm2
    WHERE lm2.emp_id = lm.emp_id
      AND YEAR(lm2.enter_date) = YEAR(CURDATE())
      AND lm2.leave_type = 'SL'
  )
) AS total_balance_sl,

-- Total Balance Leave (Always positive sum)
(
  GREATEST(
    (
      COALESCE(MAX(CASE WHEN sm.leave_type = 'CL' THEN sm.leave_count END), 0) -
      (
        SELECT COALESCE(SUM(lm2.leave_days), 0)
        FROM romsondb.cor_leave_m lm2
        WHERE lm2.emp_id = lm.emp_id
          AND YEAR(lm2.enter_date) = YEAR(CURDATE())
          AND lm2.leave_type = 'CL'
      )
    ), 0
  ) +
  GREATEST(
    (
      COALESCE(MAX(CASE WHEN sm.leave_type = 'EL' THEN sm.leave_count END), 0) -
      (
        SELECT COALESCE(SUM(lm2.leave_days), 0)
        FROM romsondb.cor_leave_m lm2
        WHERE lm2.emp_id = lm.emp_id
          AND YEAR(lm2.enter_date) = YEAR(CURDATE())
          AND lm2.leave_type = 'EL'
      )
    ), 0
  ) +
  GREATEST(
    (
      COALESCE(MAX(CASE WHEN sm.leave_type = 'SL' THEN sm.leave_count END), 0) -
      (
        SELECT COALESCE(SUM(lm2.leave_days), 0)
        FROM romsondb.cor_leave_m lm2
        WHERE lm2.emp_id = lm.emp_id
          AND YEAR(lm2.enter_date) = YEAR(CURDATE())
          AND lm2.leave_type = 'SL'
      )
    ), 0
  )
) AS total_balance_leave


  FROM romsondb.cor_leave_m lm
  LEFT JOIN romsondb.cor_emp_m em ON lm.emp_id = em.emp_id
  LEFT JOIN romsondb.cor_leave_summary sm ON sm.emp_id = lm.emp_id AND sm.year = YEAR(CURDATE())
  LEFT JOIN romsondb.cor_emp_m r ON r.emp_code = lm.reporting_to
  LEFT JOIN romsondb.cor_emp_m ab ON ab.emp_id = lm.approved_by
       WHERE lm.start_date <= '${toDate}'
      AND lm.end_date >= '${fromDate}'
      ${statusCondition}
  GROUP BY lm.id
  ORDER BY lm.start_date ASC;
  `;

  console.log("Executing Query:", query);

  sql.query(query, (err, res) => {
    if (err) {
      console.error("Query Error:", err);
      result({ error: true, data: "Something Went Wrong" });
    } else {
      result({ error: false, data: res });
    }
  });
};



////////////////crm- report day-wise-attendance data///////////////////////

attendance.DayWiseAttendanceReport = (req, result) => {
  const { fromDate, toDate } = req.query;

  const query = `
WITH RECURSIVE date_range AS (
    SELECT DATE('${fromDate}') AS punch_date
    UNION ALL
    SELECT DATE_ADD(punch_date, INTERVAL 1 DAY)
    FROM date_range
    WHERE punch_date < '${toDate}'
),
attendance_data AS (
    SELECT 
        e.emp_id,
        TRIM(e.emp_code) AS emp_code,
        e.user_name,
        DATE_FORMAT(d.punch_date, '%d-%m-%Y') AS punch_date,
        a.app_version,

        -- ✅ Updated punch_in_time
        CASE 
            WHEN (a.leave_status = 2 OR l.status = 1) THEN '' 
            ELSE DATE_FORMAT(CONVERT_TZ(a.punch_in, '+00:00', '+05:30'), '%h:%i %p')
        END AS punch_in_time,

        -- ✅ Updated punch_out_time
        CASE 
            WHEN (a.leave_status = 2 OR l.status = 1) THEN '' 
            ELSE DATE_FORMAT(CONVERT_TZ(a.punch_out, '+00:00', '+05:30'), '%h:%i %p')
        END AS punch_out_time,

        -- ✅ Updated total_hours
        CASE 
            WHEN (a.leave_status = 2 OR l.status = 1) THEN '0 hours 0 minutes'
            WHEN a.punch_in IS NOT NULL AND a.punch_out IS NOT NULL THEN 
                CONCAT(
                    FLOOR(TIMESTAMPDIFF(SECOND, a.punch_in, a.punch_out)/3600), ' hours ',
                    FLOOR((TIMESTAMPDIFF(SECOND, a.punch_in, a.punch_out) % 3600)/60), ' minutes'
                )
            ELSE '0 hours 0 minutes'
        END AS total_hours,

        -- ✅ Attendance status remains same
        CASE 
            WHEN a.leave_status = 2 THEN 'L'
            WHEN l.status = 1 THEN 'PL'
            WHEN d.punch_date > CURRENT_DATE() THEN ''
            WHEN h.date IS NOT NULL AND a.punch_in IS NULL AND a.punch_out IS NULL THEN 'PHY'
            WHEN e.state_id = 39 AND DAYOFWEEK(d.punch_date) = 7 AND h.date IS NULL AND a.punch_in IS NULL AND a.punch_out IS NULL THEN 'WEO'
            WHEN DAYOFWEEK(d.punch_date) = 1 AND a.punch_in IS NULL AND a.punch_out IS NULL THEN 'WEO'
            WHEN a.punch_in IS NULL AND a.punch_out IS NULL THEN 'A'

            -- Late punch_in: ABSHD (10:31:00 se aage)
            WHEN a.punch_in IS NOT NULL 
                 AND TIME(CONVERT_TZ(a.punch_in, '+00:00', '+05:30')) >= '10:31:00' THEN 'ABSHD'

            -- Full presence
            WHEN a.punch_in IS NOT NULL AND a.punch_out IS NOT NULL THEN 'P'

            -- Early punch_in without punch_out (10:30:59 tak P)
            WHEN a.punch_in IS NOT NULL 
                 AND (a.punch_out IS NULL OR a.punch_out = '0000-00-00 00:00:00')
                 AND TIME(CONVERT_TZ(a.punch_in, '+00:00', '+05:30')) <= '10:30:59' THEN 'P'

            ELSE 'A'
        END AS attendance_status,

        CASE 
            WHEN a.leave_status = 2 THEN a.leave_type
            ELSE '0'
        END AS leave_type,

        ROW_NUMBER() OVER (
            PARTITION BY e.emp_id, d.punch_date
            ORDER BY 
                CASE 
                    WHEN a.leave_status = 2 THEN 1  -- Approved leave highest priority
                    WHEN l.status = 1 THEN 2       -- Pending leave next
                    ELSE 3                         -- Attendance last
                END
        ) AS rn

    FROM romsondb.cor_emp_m e
    CROSS JOIN date_range d
    LEFT JOIN romsondb.cor_attendance_m a 
        ON e.emp_id = a.emp_id AND a.punch_date = d.punch_date
    LEFT JOIN romsondb.cor_holiday_m h 
        ON h.date = d.punch_date AND (h.state_id = e.state_id OR h.state_id IS NULL)
    LEFT JOIN romsondb.cor_leave_m l 
        ON e.emp_id = l.emp_id 
        AND d.punch_date BETWEEN l.start_date AND l.end_date 
        AND l.status = 1

    WHERE 
        (e.user_locked_date IS NULL OR e.user_locked_date <= d.punch_date)
        AND (e.deleted_at IS NULL OR e.deleted_at >= d.punch_date)
        AND MONTH(d.punch_date) = MONTH('${fromDate}')
        AND YEAR(d.punch_date) = YEAR('${fromDate}')
)
SELECT * FROM attendance_data WHERE rn = 1
ORDER BY emp_code, punch_date;
  `;

  console.log("Executing Query:", query);

  sql.query(query, (err, res) => {
    if (err) {
      console.error("Query Error:", err);
      result({ error: true, data: "Something Went Wrong" });
    } else {
      result({ error: false, data: res });
    }
  });
};


///////////////////////crm_tracker_report/////////////////



attendance.UserList = (req, result) => {
  const query = `
 SELECT emp_id, user_name 
FROM romsondb.cor_emp_m 
WHERE status = 'A'
ORDER BY user_name asc;
  `;
  console.log("Executing Query:", query);

  sql.query(query, (err, res) => {
    if (err) {
      console.error("Query Error:", err);
      result({ error: true, data: "Something Went Wrong" });
    } else {
      result({ error: false, data: res });
    }
  });
};



/////////////////////////crm_outlet_report/////////////////////////


const getAddress = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyC4cMHPr8PdH18gyzIJ6YMlTJSHEDGwvNM`
    );
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    return "Address not found";
  } catch (error) {
    console.error("Google Maps API error:", error);
    return "Error fetching address";
  }
};

attendance.outletReport = async (req, result) => {
  const { emp_id, from, to } = req.query;

  const query = `
    (
      SELECT 
        outlet.outlet_id,
        outlet.outlet_name,
        city.city_name,
        emp.user_name,
        TIME_FORMAT(CONVERT_TZ(m.order_time, '+00:00', 'Asia/Kolkata'), '%h:%i %p') AS date,
        m.order_lat AS lat,
        m.order_lag AS lng,
        'ORDER' AS source,
        DATE_FORMAT(m.order_date, '%Y-%m-%d') AS punch_date,
        NULL AS task_name,
        NULL AS task_remarks,
        NULL AS follow_up_date 
      FROM romsondb.cor_order_m m
      JOIN romsondb.cor_outlet_m outlet ON m.outlet_id = outlet.outlet_id
      LEFT JOIN romsondb.cor_city_m city ON outlet.city_id = city.city_id
      LEFT JOIN romsondb.cor_emp_m emp ON m.employee_id = emp.emp_id
      WHERE m.employee_id = '${emp_id}'
        AND m.order_date BETWEEN '${from}' AND '${to}'
        AND m.order_lat IS NOT NULL AND m.order_lat <> '' AND m.order_lat <> '...'
        AND m.order_lag IS NOT NULL AND m.order_lag <> '' AND m.order_lag <> '...'
    )
    UNION ALL
 (
  SELECT 
    outlet.outlet_id,
    outlet.outlet_name,
    city.city_name,
    emp.user_name,
    TIME_FORMAT(CONVERT_TZ(act.enter_date, '+00:00', 'Asia/Kolkata'), '%h:%i %p') AS date,
    act.act_lat AS lat,
    act.act_long AS lng,
    'ACTIVITY' AS source,
    DATE_FORMAT(act.activity_date, '%Y-%m-%d') AS punch_date,
    outlet.outlet_name AS task_name,
    COALESCE(
      TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(t.task_name, '[remarks]', -1), '[', 1)),
      act.remark
    ) AS task_remarks,
    NULL AS follow_up_date 
  FROM romsondb.cor_outlet_activity_m act
  LEFT JOIN romsondb.cor_outlet_m outlet ON act.outlet_id = outlet.outlet_id
  LEFT JOIN romsondb.cor_city_m city ON outlet.city_id = city.city_id
  LEFT JOIN romsondb.cor_emp_m emp ON act.enter_by = emp.emp_id
  LEFT JOIN romsondb.cor_task_m t ON t.activity_id = act.activity_id
  WHERE act.enter_by = '${emp_id}'
    AND act.activity_date BETWEEN '${from}' AND '${to}'
    AND act.act_lat IS NOT NULL AND act.act_lat <> '' AND act.act_lat <> '...'
    AND act.act_long IS NOT NULL AND act.act_long <> '' AND act.act_long <> '...'
)

    UNION ALL
    (
      SELECT 
        NULL AS outlet_id,
        NULL AS outlet_name,
        NULL AS city_name,
        emp.user_name,
        NULL AS date,
        NULL AS lat,
        NULL AS lng,
        'NEW TASK' AS source,
        DATE_FORMAT(t.enter_date, '%Y-%m-%d') AS punch_date,
        t.task_name AS task_name,
        t.remarks AS task_remarks,
        t.follow_up AS follow_up_date
      FROM romsondb.cor_task_m t
      LEFT JOIN romsondb.cor_emp_m emp ON t.enter_by = emp.emp_id
      WHERE t.enter_by = '${emp_id}'
        AND t.enter_date BETWEEN '${from}' AND '${to}'
        AND t.activity_id IS NULL
    )

    ORDER BY punch_date, date;
  `;

  try {
    // 🔍 Step 1: Fetch employee address first
    const empAddressQuery = `SELECT address FROM romsondb.cor_emp_m WHERE emp_id = '${emp_id}'`;

    sql.query(empAddressQuery, async (empErr, empRes) => {
      if (empErr || !empRes || empRes.length === 0) {
        console.error("Error fetching employee address:", empErr);
        return result({ error: true, data: "Failed to get employee address" });
      }

      const employeeAddress = empRes[0].address || "N/A";

      // 🔍 Step 2: Run main data query
      sql.query(query, async (err, res) => {
        if (err) {
          console.error("Query Error:", err);
          return result({ error: true, data: "Something Went Wrong" });
        }

        // 🔄 Step 3: Attach dynamic location and emp address to each item
        for (const item of res) {
          if (item.lat && item.lng) {
            item.address = await getAddress(item.lat, item.lng);
          } else {
            item.address = "Location not available";
          }

          item.emp_address = employeeAddress;
        }

        result({ error: false, data: res });
      });
    });
  } catch (e) {
    console.error("API error:", e);
    result({ error: true, data: "Internal Server Error" });
  }
};


//////////////////crm_performance_summary_report////////////////////////

attendance.Zonelist = (req, result) => {
  const query = `
 select zone_id, zone_name from romsondb.cor_zone_m;
  `;
  console.log("Executing Query:", query);

  sql.query(query, (err, res) => {
    if (err) {
      console.error("Query Error:", err);
      result({ error: true, data: "Something Went Wrong" });
    } else {
      result({ error: false, data: res });
    }
  });
};

attendance.Divisionlist = (req, result) => {
  const query = `
select division_id, division_name from romsondb.cor_division_m
  `;
  console.log("Executing Query:", query);

  sql.query(query, (err, res) => {
    if (err) {
      console.error("Query Error:", err);
      result({ error: true, data: "Something Went Wrong" });
    } else {
      result({ error: false, data: res });
    }
  });
};

attendance.PerformanceSummary = (req, result) => {
  const {
    from_date,
    to_date,
    division_id,
    zone_id
  } = req.query;

  let whereClause = `WHERE em.deleted_at IS NULL`;
  const params = [];

  // Zone filter
  if (zone_id) {
    whereClause += ` AND em.zone_id = ?`;
    params.push(zone_id);
  }

  // Division filter
  if (division_id) {
    whereClause += ` AND em.division = ?`;
    params.push(division_id);
  }

  // Date filter logic
  if (from_date && to_date) {
    whereClause += ` AND mtp.outlet_date BETWEEN ? AND ?`;
    params.push(from_date, to_date);
  } else if (from_date && !to_date) {
    whereClause += ` AND mtp.outlet_date = ?`;
    params.push(from_date);
  } else if (!from_date && !to_date) {
    whereClause += ` AND mtp.outlet_date = CURDATE()`;
  }

  const query = `

   SELECT 
  DATE_FORMAT(mtp.outlet_date, '%Y-%m-%d') AS mtp_date,
  CONCAT(mtp.user_id, '-', em.user_name) AS employee_id_name,
  divm.division_name,  
  DATE_FORMAT(aam.punch_date, '%Y-%m-%d') AS punch_date,
  
  CASE 
    WHEN DAYOFWEEK(aam.punch_date) = 1 THEN 
      CASE
        WHEN aam.leave_status = 2 THEN 'Leave'
        WHEN aam.punch_in IS NULL AND aam.punch_out IS NULL THEN 'Week Off'
        ELSE 
          CASE 
            WHEN h.date IS NOT NULL AND aam.punch_in IS NULL AND aam.punch_out IS NULL THEN 'Holiday'
            WHEN em.state_id = 39 AND DAYOFWEEK(aam.punch_date) = 7 AND h.date IS NULL AND aam.punch_in IS NULL AND aam.punch_out IS NULL THEN 'Week Off'
            WHEN aam.leave_status = 1 THEN 'Absent'
            WHEN aam.status = 1 AND TIMESTAMPDIFF(HOUR, aam.punch_in, aam.punch_out) >= 8 THEN 'Present'
            WHEN aam.status = 1 AND TIMESTAMPDIFF(HOUR, aam.punch_in, aam.punch_out) >= 4 THEN 'Half Day'
            ELSE 'Absent'
          END
      END
    ELSE 
      CASE 
        WHEN aam.leave_status = 2 THEN 'Leave'
        WHEN aam.leave_status = 1 THEN 'Absent'
        WHEN aam.status = 1 AND TIMESTAMPDIFF(HOUR, aam.punch_in, aam.punch_out) >= 8 THEN 'Present'
        WHEN aam.status = 1 AND TIMESTAMPDIFF(HOUR, aam.punch_in, aam.punch_out) >= 4 THEN 'Half Day'
        ELSE 'Absent'
      END
  END AS attendance_status,
  
  DATE_FORMAT(CONVERT_TZ(aam.punch_in, '+00:00', '+05:30'), '%h:%i %p') AS punch_in_time,
  DATE_FORMAT(CONVERT_TZ(aam.punch_out, '+00:00', '+05:30'), '%h:%i %p') AS punch_out_time,

  -- Self/Joint Calls & Orders, etc. (same as before, no change needed)
  (
    SELECT COUNT(DISTINCT act.outlet_id)
    FROM romsondb.cor_outlet_activity_m act
    WHERE DATE_FORMAT(act.enter_date, '%Y-%m-%d') = mtp.outlet_date 
      AND act.enter_by = mtp.user_id
      AND act.call_type = 'Self'
  ) AS self_call_count,
  
  (
    SELECT COUNT(DISTINCT act.outlet_id)
    FROM romsondb.cor_outlet_activity_m act
    WHERE DATE_FORMAT(act.enter_date, '%Y-%m-%d') = mtp.outlet_date 
      AND act.enter_by = mtp.user_id
      AND act.call_type = 'Joined'
  ) AS joint_call_count,

  (
    SELECT COUNT(DISTINCT oc.outlet_id)
    FROM romsondb.cor_order_m oc 
    WHERE oc.order_date = mtp.outlet_date 
      AND oc.enter_by = mtp.user_id 
      AND oc.call_type = 'Self'
  ) AS self_order_count,

  (
    SELECT COUNT(DISTINCT oc.outlet_id)
    FROM romsondb.cor_order_m oc 
    WHERE oc.order_date = mtp.outlet_date 
      AND oc.enter_by = mtp.user_id 
      AND oc.call_type = 'Joined'
  ) AS joint_order_count,

  (
    SELECT COUNT(DISTINCT om.outlet_id)
    FROM romsondb.cor_mtp_a bm
    INNER JOIN romsondb.cor_outlet_m om ON om.beat_id = bm.beat_id
    WHERE om.status = 'A'
      AND om.deleted_at IS NULL
      AND bm.user_id = mtp.user_id
      AND bm.outlet_date = mtp.outlet_date
  ) AS outlet_count,

  (
    SELECT COUNT(DISTINCT oa.outlet_id)
    FROM romsondb.cor_outlet_activity_m oa 
    WHERE DATE_FORMAT(oa.enter_date, '%Y-%m-%d') = mtp.outlet_date 
      AND oa.enter_by = mtp.user_id
  ) AS total_activity_covered_outlet,

  (
   SELECT COUNT(DISTINCT co.outlet_id)
    FROM romsondb.cor_order_m co
    WHERE DATE_FORMAT(co.order_time, '%Y-%m-%d') = mtp.outlet_date 
      AND co.enter_by = mtp.user_id
  ) AS total_order_covered_outlet,

  (
    SELECT COUNT(DISTINCT oa.outlet_id)
    FROM romsondb.cor_outlet_activity_m oa 
    WHERE DATE_FORMAT(oa.enter_date, '%Y-%m-%d') = mtp.outlet_date 
      AND oa.enter_by = mtp.user_id
  ) AS total_activities_count,


  (
    SELECT COUNT(DISTINCT oc.outlet_id)
    FROM romsondb.cor_order_m oc 
    WHERE oc.order_date = mtp.outlet_date 
      AND oc.enter_by = mtp.user_id
  ) AS order_count_total,

  (
    SELECT ROUND(SUM(od.order_amt), 2) 
    FROM romsondb.cor_order_m om 
    LEFT JOIN romsondb.cor_order_d od ON om.order_id = od.order_id 
    WHERE om.order_date = mtp.outlet_date 
      AND om.enter_by = mtp.user_id 
  ) AS order_amt,

  (
    SELECT ROUND(SUM(od.item_qty), 2) 
    FROM romsondb.cor_order_m om 
    LEFT JOIN romsondb.cor_order_d od ON om.order_id = od.order_id 
    WHERE om.order_date = mtp.outlet_date 
      AND om.enter_by = mtp.user_id 
  ) AS item_qty,

    (
    SELECT COUNT(*)
    FROM romsondb.cor_task_m t
    WHERE DATE_FORMAT(t.enter_date, '%Y-%m-%d') = mtp.outlet_date
      AND t.enter_by = mtp.user_id
  ) AS task_count,

  bm.beat_name

FROM cor_emp_m em
LEFT JOIN cor_mtp_a mtp ON em.emp_id = mtp.user_id
LEFT JOIN cor_beat_m bm ON mtp.beat_id = bm.beat_id
LEFT JOIN cor_attendance_m aam ON em.emp_id = aam.emp_id AND mtp.outlet_date = aam.punch_date
LEFT JOIN cor_division_m divm ON em.division = divm.division_id
LEFT JOIN romsondb.cor_holiday_m h ON h.date = aam.punch_date AND FIND_IN_SET(em.state_id, h.state_id) > 0

${whereClause}

ORDER BY mtp.outlet_date ASC
`;

  // console.log("Executing Query:", query, "With params:", params);

  sql.query(query, params, (err, resData) => {
    if (err) {
      // console.error("Query Error:", err);
      result({ error: true, data: "Something Went Wrong" });
    } else {
      result({ error: false, data: resData });
    }
  });
};

////////////////////////CRM_Activity_report/////////////////////////

attendance.CrmActivityReport = (req, result) => {
  const { fromDate, toDate } = req.query;

  const query = `
SELECT 
  CONCAT(e1.user_name, ' - ', a.enter_by) AS user_name,
  CONCAT(a.outlet_id, ' - ', o.outlet_name) AS outlet,
  CONCAT(a.hospital_customer_name, ' - ', a.user_type) AS customer,
  s.sku_name AS sku_name,
  a.remark AS remarks,
  CONCAT(a.act_lat, ', ', a.act_long) AS lat_long,
  a.follow_up AS follow_up,
  CASE 
    WHEN a.call_type = 'S' THEN 'Self'
    WHEN a.call_type = 'J' THEN 'Joined'
    ELSE a.call_type
  END AS call_type,
  a.joined_name AS joined_person_name,
        DATE_FORMAT(a.activity_date, '%Y-%m-%d') AS activity_date
FROM romsondb.cor_outlet_activity_m a
LEFT JOIN romsondb.cor_emp_m e1 ON a.enter_by = e1.emp_id
LEFT JOIN romsondb.cor_outlet_m o ON a.outlet_id = o.outlet_id
LEFT JOIN romsondb.cor_sku_m s ON a.item_id = s.sku_id
WHERE a.activity_date BETWEEN '${fromDate}' AND '${toDate}';

  `;

  console.log("Executing Query:", query);

  sql.query(query, (err, res) => {
    if (err) {
      console.error("Query Error:", err);
      result({ error: true, data: "Something Went Wrong" });
    } else {
      result({ error: false, data: res });
    }
  });
};

//////////////////////CRM_ORDER_REPORT///////////////////////////////////
attendance.CrmOrderReport = (req, result) => {
  const { fromDate, toDate } = req.query;

  const query = `
SELECT 
    o.order_id AS "OrderID",
    DATE_FORMAT(o.order_date, '%e/%c/%Y') AS "OrderDate",
    DATE_FORMAT(o.order_time, '%l:%i %p') AS "OrderTime",
    CONCAT(o.outlet_id, ' - ', ot.outlet_name) AS "Outlet",
    ot.outlet_category_id AS "OutletCat",
    b.beat_name AS "Beat",
    d.dealer_name AS "DealerName",
    z.zone_name AS "ZoneName",
    CONCAT(e.user_name, ' - ', o.employee_id) AS "UserName",
    CONCAT(rm.user_name, ' - ', e.reporting_to) AS "ReportingTo",
    od.item_id AS "skuID",
    s.sku_name AS "SkuName",
    s.sku_code AS "skucode",
    ROUND(od.item_qty, 3) AS "TTLQTY",
    ROUND(od.item_discount, 3) AS "Discount",
    ROUND(od.item_price_unit, 3) AS "SkuPrice",
    ROUND((od.item_qty * od.item_price_unit), 3) AS "Amount",
    ROUND(od.item_gst, 3) AS "GST",
    ROUND((od.item_qty * od.item_price_unit * od.item_gst / 100), 3) AS "GstAmount",
    ROUND(((od.item_qty * od.item_price_unit) + (od.item_qty * od.item_price_unit * od.item_gst / 100)), 3) AS "NetAmount",
    CONCAT(o.order_lat, ', ', o.order_lag) AS "Location",
    o.call_type AS "CALLWITH",
    o.joined_name AS "JOINPERSONNAME"
FROM cor_order_m o
LEFT JOIN cor_order_d od ON o.order_id = od.order_id
LEFT JOIN cor_emp_m e ON o.employee_id = e.emp_id
LEFT JOIN cor_emp_m rm ON e.reporting_to = rm.emp_id
LEFT JOIN cor_outlet_m ot ON o.outlet_id = ot.outlet_id
LEFT JOIN cor_beat_m b ON o.beat_id = b.beat_id
LEFT JOIN cor_dealer_m d ON o.dealer_id = d.dealer_id
LEFT JOIN cor_zone_m z ON o.zone_id = z.zone_id
LEFT JOIN cor_sku_m s ON od.item_id = s.sku_id
WHERE o.order_date BETWEEN '${fromDate}' AND '${toDate}'
ORDER BY o.order_date, e.user_name, b.beat_name, o.outlet_id, s.sku_name;
  `;

  console.log("Executing Query:", query);

  sql.query(query, (err, res) => {
    if (err) {
      console.error("Query Error:", err);
      result({ error: true, data: "Something Went Wrong" });
    } else {
      result({ error: false, data: res });
    }
  });
};



///////////////////////regularization-report//////////////////////////

attendance.RegularizationReport = (req, result) => {
  const { fromDate, toDate, status } = req.query;

  let query = `
SELECT 
    r.Regular_id,
    r.enter_by,
    TRIM(e.user_name) AS emp_name,
    DATE_FORMAT(r.request_date, '%d/%m/%Y') AS requested_date,
    DATE_FORMAT(COALESCE(r.punch_in, a.punch_in), '%Y-%m-%d %H:%i:%s') AS punch_in,
    DATE_FORMAT(COALESCE(r.punch_out, a.punch_out), '%Y-%m-%d %H:%i:%s') AS punch_out,
    r.Request_Remarks,
    e.emp_code,
    CASE 
        WHEN r.status = 'P' THEN 'Pending'
        WHEN r.status = 'A' THEN 'Accepted'
        WHEN r.status = 'R' THEN 'Rejected'
    END AS status,
    CONCAT(IFNULL(r.Approved_ID, ''), ' - ', IFNULL(approver.user_name, '')) AS approved_by,
    DATE_FORMAT(r.Approved_date, '%d/%m/%Y') AS approved_date
FROM romsondb.cor_regulization_m r
LEFT JOIN romsondb.cor_emp_m e 
    ON r.enter_by = e.emp_id
LEFT JOIN romsondb.cor_emp_m approver 
    ON r.Approved_ID = approver.emp_id
LEFT JOIN romsondb.cor_attendance_m a
    ON r.enter_by = a.emp_id
    AND r.request_date = a.punch_date
WHERE r.request_date BETWEEN ? AND ?
`;

  const queryParams = [fromDate, toDate];

  if (status && status !== "") {
    query += ` AND (
      (r.status = 'P' AND ? = 'Pending') OR
      (r.status = 'A' AND ? = 'Accepted') OR
      (r.status = 'R' AND ? = 'Rejected')
    )`;
    queryParams.push(status, status, status);
  }

  query += `ORDER BY r.request_date ASC
`;

  console.log("Executing Query:", query, "With Params:", queryParams);

  sql.query(query, queryParams, (err, res) => {
    if (err) {
      console.error("Query Error:", err);
      return result({ error: true, data: "Something Went Wrong" });
    }
    return result({ error: false, data: res });
  });
};


///////////////////////user-master-report///////////////////////////////
// attendance.UserMasterReport
/////////////////////////user-master-report-backup////////////////////////////////

attendance.UserMasterReport = (req, result) => {
  const statusFilter = (req.query.status || 'ALL').toUpperCase(); // from query
  let query = `
SELECT 
    CASE WHEN e.status = 'A' THEN 'Active' ELSE 'Inactive' END AS 'Status',
    e.emp_id AS 'emp_id',
    e.user_name AS 'Name',
    e.Head_Quater_name AS 'Head_Quater',
    CONCAT(d.division_name, '-', e.division) AS 'Division',
    CONCAT(z.zone_name, '-', e.zone_id) AS 'Zone_Name',
    e.email AS 'Email',
    e.phone_number AS 'Phone_No',
    CONCAT(des.designation_name, '-', e.designation) AS 'Designation',
    r.role_name AS 'Role',
    CONCAT(dep.department_name, '-', e.department_id) AS 'Department',
    CONCAT(mgr.user_name, ' - ', mgr.emp_id) AS 'Reporting_To',
    dl.dealer_name AS 'Dealer',
    CONCAT(e.city_id, '-', c.city_name) AS 'City',
    e.emp_code AS 'EMP_Code',
    c.city_type AS 'City_Type',
    DATE_FORMAT(e.user_locked_date, '%d/%m/%Y') AS 'Joining_Date',
    DATE_FORMAT(e.deleted_at, '%d/%m/%Y') AS 'Resign_Date'
FROM romsondb.cor_emp_m e
LEFT JOIN romsondb.cor_division_m d ON e.division = d.division_id
LEFT JOIN romsondb.cor_zone_m z ON e.zone_id = z.zone_id
LEFT JOIN romsondb.cor_role_m r ON e.role = r.role_id
LEFT JOIN romsondb.cor_emp_m mgr ON e.reporting_to = mgr.emp_id
LEFT JOIN romsondb.cor_dealer_m dl ON e.dealer_id = dl.dealer_id
LEFT JOIN romsondb.cor_city_m c ON e.city_id = c.city_id
LEFT JOIN romsondb.cor_designation_m des ON e.designation = des.designation_id
LEFT JOIN romsondb.cor_department_m dep ON e.department_id = dep.department_id
WHERE (
    ? = 'ALL'
    OR (? = 'ACTIVE' AND e.status = 'A')
    OR (? = 'INACTIVE' AND e.status = 'I')
)
ORDER BY e.user_name;
`;

  let queryParams = [statusFilter, statusFilter, statusFilter];

  sql.query(query, queryParams, (err, res) => {
    if (err) {
      console.error("Query Error:", err);
      return result({ error: true, data: "Something Went Wrong" });
    }
    return result({ error: false, data: res });
  });
};



///////////////////////manually_attendance_insert//////////////////////////

attendance.ManuallyInsertAttendance = (req, result) => {
  const {
    emp_id,
    out_lat,
    out_long,
    out_remark,
    out_address,
    in_lat,
    in_lng,
    enter_by,
    in_remark,
    work_place,
    in_address,
    app_version,
    punch_date,
    punch_in,
    punch_out,
    enter_date
  } = req.body;

  const query = `
    INSERT INTO romsondb.cor_attendance_m (
      attendance_id,
      emp_id,
      shift,
      punch_date,
      punch_in,
      punch_out,
      out_lat,
      out_long,
      out_remark,
      out_address,
      in_lat,
      in_lng,
      enter_by,
      enter_date,
      in_remark,
      work_place,
      in_address,
      app_version
    ) VALUES (
      romsondb.all_auto_no(55),
      ?, 'D', ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `;

  const params = [
    emp_id,
    punch_date,
    punch_in,
    punch_out,
    out_lat,
    out_long,
    out_remark,
    out_address,
    in_lat,
    in_lng,
    enter_by,
    enter_date,
    in_remark,
    work_place,
    in_address,
    app_version
  ];

  sql.query(query, params, (err, res) => {
    if (err) {
      console.error("DB Error: ", err);
      return result({ error: true, data: "Something Went Wrong" });
    }
    result({ error: false, data: res });
  });
};




module.exports = attendance;