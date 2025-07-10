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

  if (versionToNumber(clientVersion) < versionToNumber(minVersion) && versionToNumber(clientVersion)!= 0) {
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

  // Check if the current time is after 9 PM
  if (currentHour > 19 || (currentHour === 19 && currentMinute > 30)) {
    result({ error: true, message: "You are not allowed to punch out after 7:30 PM" });
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

  // Determine initial leave type based on number of days
  // Use leaveType from frontend if passed, otherwise fallback logic
  let conditionalLeaveType = leaveType;

  if (!conditionalLeaveType) {
    if (numofdays === 1) {
      conditionalLeaveType = 'SL';
    } else if (numofdays === 2) {
      conditionalLeaveType = 'CL';
    } else {
      conditionalLeaveType = 'EL';
    }
  }


  // Query to check leave balances for the employee
  const leaveBalanceQuery = `
    SELECT 
      GREATEST(
        COALESCE(MAX(CASE WHEN sm.leave_type = 'CL' THEN sm.leave_count ELSE 0 END), 12) - 
        COALESCE(SUM(CASE WHEN lm.leave_type = 'CL' THEN lm.leave_days ELSE 0 END), 0), 
        0
      ) AS cl_balance,
      GREATEST(
        COALESCE(MAX(CASE WHEN sm.leave_type = 'EL' THEN sm.leave_count ELSE 0 END), 15) - 
        COALESCE(SUM(CASE WHEN lm.leave_type = 'EL' THEN lm.leave_days ELSE 0 END), 0), 
        0
      ) AS el_balance,
      GREATEST(
        COALESCE(MAX(CASE WHEN sm.leave_type = 'SL' THEN sm.leave_count ELSE 0 END), 6) - 
        COALESCE(SUM(CASE WHEN lm.leave_type = 'SL' THEN lm.leave_days ELSE 0 END), 0), 
        0
      ) AS sl_balance
    FROM 
      romsondb.cor_leave_summary sm
    LEFT JOIN 
      romsondb.cor_leave_m lm 
    ON 
      sm.emp_id = lm.emp_id 
      AND sm.leave_type = lm.leave_type
      AND YEAR(lm.enter_date) = YEAR(CURRENT_DATE())
    WHERE 
      sm.emp_id = '${empID}'
    GROUP BY 
      sm.emp_id`;

  sql.query(leaveBalanceQuery, (err, balanceRes) => {
    if (err) {
      console.log(err);
      result({ error: true, data: "Something Went Wrong" });
      return;
    }

    // Extract leave balances or assign default values
    const { cl_balance, el_balance, sl_balance } = balanceRes[0] || { cl_balance: 12, el_balance: 15, sl_balance: 6 };

    // Determine final leave type based on balance and number of days
    let lopMessage = null;

    if (conditionalLeaveType === 'SL' && sl_balance > 0) {
      conditionalLeaveType = 'SL';
    } else if (conditionalLeaveType === 'CL' && cl_balance > 0) {
      conditionalLeaveType = 'CL';
    } else if (conditionalLeaveType === 'EL' && el_balance > 0) {
      conditionalLeaveType = 'EL';
    } else {
      conditionalLeaveType = 'LOP';
      lopMessage = "You do not have sufficient leave balance. Your leave will be marked as LOP (Loss of Pay).";
    }

    // Check for overlapping leave applications
    const overlapCheckQuery = `
      SELECT * FROM romsondb.cor_leave_m 
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

      // Insert leave application with the determined leave type
      const insertLeaveQuery = `
        INSERT INTO romsondb.cor_leave_m 
          (emp_id, reporting_to, leave_type, start_date, end_date, leave_days, leave_reason, enter_by, enter_date)
        VALUES 
          ('${empID}', '${rpPerson}', '${conditionalLeaveType}', '${fromDate}', '${toDate}', '${numofdays}', '${leavereason}', '${enterBy}', sysdate())`;

      sql.query(insertLeaveQuery, (err, insertRes) => {
        if (err) {
          console.log(err);
          result({ error: true, data: "Something Went Wrong" });
          return;
        }

        // Provide appropriate response message
        result({
          error: false,
          data: insertRes,
          msg: lopMessage
            ? lopMessage + " Leave application submitted successfully."
            : "Leave application submitted successfully.",
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
  sql.query(`SELECT sum(leave_days) as leaveTake FROM romsondb.cor_leave_m where emp_id='${req.body.empid}'  AND YEAR(enter_date) = YEAR(CURRENT_DATE());`,
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

attendance.attandance_count = (req, result) => {
  const punchDate = req.query.punch_date;
  const empId = req.query.emp_id;
  const user = JSON.parse(req.headers.authorization);

  if (user.role === 1) {
    let query = `
      SELECT 
        IFNULL(a.attendance_id, NULL) AS attendance_id,
        d.punch_date,
        COALESCE(TIME(a.punch_in), '00:00:00') AS punch_in_time,
        COALESCE(TIME(a.punch_out), '00:00:00') AS punch_out_time,
        e.emp_id,
        TRIM(e.emp_code) AS emp_code,
        TRIM(e.user_name) AS user_name,
        'RGPL' AS company_name,

        CASE 
          WHEN DAYOFWEEK(d.punch_date) = 1 THEN 
            CASE
              WHEN a.leave_status = 2 THEN 'L'
              WHEN a.punch_in IS NULL AND a.punch_out IS NULL THEN 'WEO'
              ELSE 
                CASE 
                  WHEN h.date IS NOT NULL AND a.punch_in IS NULL AND a.punch_out IS NULL THEN 'PHY'
                  WHEN e.state_id = 39 AND DAYOFWEEK(d.punch_date) = 7 AND h.date IS NULL AND a.punch_in IS NULL AND a.punch_out IS NULL THEN 'WEO'
                  WHEN a.leave_status = 1 THEN 'A'
                  WHEN a.status = 1 AND TIMESTAMPDIFF(HOUR, a.punch_in, a.punch_out) >= 8 THEN 'P'
                  WHEN a.status = 1 AND TIMESTAMPDIFF(HOUR, a.punch_in, a.punch_out) >= 4 THEN 'ABSHD'
                  ELSE 'A'
                END
            END
          ELSE 
            CASE 
              WHEN a.leave_status = 2 THEN 'L'
              WHEN a.leave_status = 1 THEN 'A'
              WHEN a.status = 1 AND TIMESTAMPDIFF(HOUR, a.punch_in, a.punch_out) >= 8 THEN 'P'
              WHEN a.status = 1 AND TIMESTAMPDIFF(HOUR, a.punch_in, a.punch_out) >= 4 THEN 'ABSHD'
              ELSE 'A'
            END
        END AS attendance_status,

        -- ✅ Updated leave_type logic
        COALESCE((
          SELECT lsub.leave_type 
          FROM romsondb.cor_leave_m lsub
          WHERE lsub.emp_id = e.emp_id
            AND DATE(lsub.enter_date) = d.punch_date
            AND lsub.status = 2
          ORDER BY lsub.start_date ASC
          LIMIT 1
        ), '0') AS leave_type,

        -- Applied date if available
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

        IF(a.status = 1 AND a.punch_in IS NOT NULL AND a.punch_out IS NOT NULL,
          TIMESTAMPDIFF(HOUR, a.punch_in, a.punch_out),
          0
        ) AS total_hours

      FROM (SELECT ? AS punch_date) d
      LEFT JOIN romsondb.cor_emp_m e ON 1 = 1
      LEFT JOIN romsondb.cor_attendance_m a ON e.emp_id = a.emp_id AND a.punch_date = d.punch_date
      LEFT JOIN romsondb.cor_leave_m l ON e.emp_id = l.emp_id 
        AND l.start_date <= d.punch_date 
        AND (l.end_date >= d.punch_date OR l.end_date IS NULL)
      LEFT JOIN romsondb.cor_holiday_m h 
        ON FIND_IN_SET(e.state_id, h.state_id) > 0
        AND h.date = d.punch_date
      WHERE e.status = 'A'
    `;

    if (empId) {
      query += ` AND e.emp_id = ?`;
    }

    const queryParams = empId ? [punchDate, empId] : [punchDate];

    sql.query(query, queryParams, (err, res) => {
      if (err) {
        console.error("Query Error: ", err);
        result({ error: true, message: "Failed to fetch attendance data" });
        return;
      }

      const convertedResults = res.map(record => {
        // Format punch-in and punch-out
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

        // Format total_hours as HH:MM
        if (
          record.punch_in_time !== '00:00:00' &&
          record.punch_out_time !== '00:00:00'
        ) {
          const punchInMoment = moment(record.punch_in_time, 'h:mm A');
          const punchOutMoment = moment(record.punch_out_time, 'h:mm A');

          const duration = moment.duration(punchOutMoment.diff(punchInMoment));
          const totalHours = Math.floor(duration.asHours());
          const totalMinutes = duration.minutes();

          record.total_hours = `${totalHours.toString().padStart(2, '0')}:${totalMinutes
            .toString()
            .padStart(2, '0')}`;
        } else {
          record.total_hours = '00:00';
        }

        // Generate fake attendance_id if null
        if (!record.attendance_id) {
          const fixedPrefix = '100';
          const uniqueKey = `${record.emp_id}-${record.punch_date}`;
          const hash = crypto.createHash('sha256')
            .update(uniqueKey)
            .digest('hex');
          const uniqueSuffix = Math.abs(parseInt(hash.slice(-5), 16)) % 100000;
          record.attendance_id = `${fixedPrefix}${String(uniqueSuffix).padStart(5, '0')}`;
        }

        return record;
      });

      result({ error: false, data: convertedResults });
    });
  } else {
    result({ error: true, message: "Unauthorized access" });
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
        CASE
        WHEN  a.leave_status = 2 THEN 'L'
  WHEN d.punch_date > CURRENT_DATE() THEN ''
        WHEN h.date IS NOT NULL AND a.punch_in IS NULL AND a.punch_out IS NULL THEN 'PHY'
              WHEN e.state_id = 39 AND DAYOFWEEK(d.punch_date) = 7 AND h.date IS NULL AND a.punch_in IS NULL AND a.punch_out IS NULL THEN 'WEO'
            WHEN DAYOFWEEK(d.punch_date) = 1 AND a.punch_in IS NULL AND a.punch_out IS NULL THEN 'WEO'
          WHEN a.punch_in IS NULL AND a.punch_out IS NULL THEN 'A'
          WHEN a.status = 1 AND TIMESTAMPDIFF(HOUR, a.punch_in, a.punch_out) >= 8 THEN 'P'
          WHEN a.status = 1 AND TIMESTAMPDIFF(HOUR, a.punch_in, a.punch_out) >= 4 THEN 'ABSHD'
          ELSE 'A'
        END AS attendance_status
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
      WHERE e.status = 'A'
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
            month_days: daysInMonth
          };
        }

        employeeMap[empId][day] = status;

        // Accurate count only on valid working status
        if (status === 'P') {
          employeeMap[empId].present_days += 1;
        } else if (status === 'ABSHD') {
          employeeMap[empId].half_days += 1;
        } else if (status === 'L') {
          employeeMap[empId].leave += 1;
        } else if (status === 'PHY') {
          employeeMap[empId].holiday += 1;
        } else if (status === 'A') {
          employeeMap[empId].absent += 1;
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
    );
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
    romsondb.cor_leave_summary sm
LEFT JOIN 
    romsondb.cor_leave_m lm 
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
  sql.query(`select leave_type,leave_description from romsondb.cor_leave_type`, (err, res) => {
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


attendance.leaveReportSummary = (req, result) => {
  const { fromDate, toDate, statusFilter } = req.body;

  // Build status condition dynamically
  let statusCondition = "";
  if (statusFilter === "Pending") {
    statusCondition = "AND lm.status = 1 AND lm.approved_by IS NULL";
  } else if (statusFilter === "Accepted") {
    statusCondition = "AND lm.status = 1 AND lm.approved_by IS NOT NULL";
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

      (
        COALESCE(MAX(CASE WHEN sm.leave_type = 'CL' THEN sm.leave_count ELSE 0 END), 0) +
        COALESCE(MAX(CASE WHEN sm.leave_type = 'EL' THEN sm.leave_count ELSE 0 END), 0) +
        COALESCE(MAX(CASE WHEN sm.leave_type = 'SL' THEN sm.leave_count ELSE 0 END), 0)
      ) AS total_allocated_leave,

      (
        SELECT 
          COALESCE(SUM(CASE WHEN lm2.leave_type = 'CL' THEN lm2.leave_days ELSE 0 END), 0) +
          COALESCE(SUM(CASE WHEN lm2.leave_type = 'EL' THEN lm2.leave_days ELSE 0 END), 0) +
          COALESCE(SUM(CASE WHEN lm2.leave_type = 'SL' THEN lm2.leave_days ELSE 0 END), 0)
        FROM romsondb.cor_leave_m lm2
        WHERE lm2.emp_id = lm.emp_id
          AND YEAR(lm2.enter_date) = YEAR(CURDATE())
      ) AS total_availed_leave,

      (
        (
          COALESCE(MAX(CASE WHEN sm.leave_type = 'CL' THEN sm.leave_count ELSE 0 END), 0) +
          COALESCE(MAX(CASE WHEN sm.leave_type = 'EL' THEN sm.leave_count ELSE 0 END), 0) +
          COALESCE(MAX(CASE WHEN sm.leave_type = 'SL' THEN sm.leave_count ELSE 0 END), 0)
        ) -
        (
          SELECT 
            COALESCE(SUM(CASE WHEN lm2.leave_type = 'CL' THEN lm2.leave_days ELSE 0 END), 0) +
            COALESCE(SUM(CASE WHEN lm2.leave_type = 'EL' THEN lm2.leave_days ELSE 0 END), 0) +
            COALESCE(SUM(CASE WHEN lm2.leave_type = 'SL' THEN lm2.leave_days ELSE 0 END), 0)
          FROM romsondb.cor_leave_m lm2
          WHERE lm2.emp_id = lm.emp_id
            AND YEAR(lm2.enter_date) = YEAR(CURDATE())
        )
      ) AS total_balance_leave

    FROM romsondb.cor_leave_m lm
    JOIN romsondb.cor_emp_m em ON em.emp_id = lm.emp_id
    LEFT JOIN romsondb.cor_leave_summary sm ON sm.emp_id = lm.emp_id
    LEFT JOIN romsondb.cor_emp_m r ON r.emp_id = lm.reporting_to
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
)

SELECT 
    e.emp_id,
    TRIM(e.emp_code) AS emp_code,
    e.user_name,
    DATE_FORMAT(d.punch_date, '%d-%m-%Y') AS punch_date,
    a.app_version,
   DATE_FORMAT(CONVERT_TZ(punch_in, '+00:00', '+05:30'), '%h:%i %p') AS punch_in_time,
      DATE_FORMAT(CONVERT_TZ(punch_out, '+00:00', '+05:30'), '%h:%i %p') AS punch_out_time,


    CASE 
        WHEN a.punch_in IS NOT NULL AND a.punch_out IS NOT NULL THEN 
            CONCAT(
                FLOOR(TIMESTAMPDIFF(SECOND, a.punch_in, a.punch_out)/3600), ' hours ',
                FLOOR((TIMESTAMPDIFF(SECOND, a.punch_in, a.punch_out) % 3600)/60), ' minutes'
            )
        ELSE '0 hours 0 minutes'
    END AS total_hours,

    CASE 
        WHEN a.leave_status = 2 THEN 'L'
        WHEN a.punch_in IS NOT NULL AND a.punch_out IS NOT NULL THEN 'P'
        ELSE 'A'
    END AS attendance_status

FROM 
    romsondb.cor_emp_m e
CROSS JOIN 
    date_range d
LEFT JOIN 
    romsondb.cor_attendance_m a 
    ON e.emp_id = a.emp_id AND a.punch_date = d.punch_date
WHERE 
    e.status = 'A'
ORDER BY 
    e.emp_code, d.punch_date;

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



module.exports = attendance;