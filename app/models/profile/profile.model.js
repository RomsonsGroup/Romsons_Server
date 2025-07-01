const sql = require("../db.js");

// constructor
const profile = function(osbs) {
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


profile.profiledata = (req, result) => {
  const query = `
      SELECT emp.user_name, emp.email, emp.phone_number, emp.division, 
             divm.division_name, emp.Head_Quater_name, emp.enter_date,emp.emp_code,emp.emp_id,emp.company_code,
             rep.user_name AS reporting_name  -- Fetch reporting person's name
      FROM romsondb.cor_emp_m emp
      LEFT JOIN romsondb.cor_division_m divm 
      ON emp.division = divm.division_id 
      LEFT JOIN romsondb.cor_emp_m rep 
      ON emp.reporting_to = rep.emp_id  -- Join to get reporting person's name
      WHERE emp.emp_id = ?`;

  sql.query(query, [req.body.empid], (err, res) => {
      if (err) {
          console.error("Error in profiledata query:", err);
          result({ error: true, data: "Something Went Wrong" });
      } else {
          console.log("Profile Data Response:", res);
          result({ error: false, data: res });
      }
  });
};


  profile.testServer =  (req, result) => {
    sql.query( `SELECT user_name,email,phone_number,division,
    Head_Quater_name,enter_date FROM romsondb.cor_emp_m`, (err, res) => {
      console.log("osbss: ", res);
      if (err) {
        result({ error: true, data: "Something Went Wrong" })
      }
      result({ error: false, data: res })
    });
  };


  
module.exports = profile;