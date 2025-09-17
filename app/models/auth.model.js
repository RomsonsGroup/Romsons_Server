const sql = require("./db.js");
var md5 = require('md5');
// constructor
const auth = function(osbs) {
  this.title = osbs.title;
  this.description = osbs.description;
  this.published = osbs.published;
};



// auth.login =  (req, result) => {
//   const empid = req.body.empid;
//   const Password = md5(req.body.Password);
//   sql.query(`SELECT 
//   em.emp_id,em.user_name as full_name,
//   em.email,
//   em.phone_number,
//   em.designation,
//   em.role,
//   em.emp_type,
//   em.division,
//   em.status,
//   em.address, 
//   em.reporting_to,
//   rol.role_name, 
//   rol.status as rol_status,
//   rol.alias as rol_alias_name,
//   dev.division_name,
//   dev.status as division_status,
//   em.city_id,
//   em.department_id,em.deleted_at
// FROM ((crm_dev_db.cor_emp_m em
// INNER JOIN crm_dev_db.cor_role_m rol ON em.role = rol.role_id)
// INNER JOIN crm_dev_db.cor_division_m dev ON em.division = dev.division_id)  
// where em.emp_id= '${empid}' and em.password = '${Password}'`, (err, res) => {
  
  

//     console.log("osbss: ", res);
   

//     if(res.length == 0){
//       userData = {
//         error: true,
//         data: "Enter Valid Emp ID & Password"
//       }
//       result({userData})
//     }else{
//       userData = {
//         error: false,
//         data: res
//       }
//       result({ userData })
//     }
//   });
// };


auth.login = (req, result) => {
  const empid = req.body.empid;
  const Password = md5(req.body.Password);
  console.log(empid, "hfrj");
  console.log(Password, "hjjrrkf");
  
  
  sql.query(`SELECT 
    em.emp_id,
    em.user_name AS full_name,
    em.email,
    em.phone_number,
    em.designation,
    em.role,
    em.emp_type,
    em.division,
    em.zone_id,
    em.status,
    em.address, 
    em.reporting_to,
    em.state_id,
    rol.role_name, 
    rol.status AS rol_status,
    rol.alias AS rol_alias_name,
    dev.division_name,
    dev.status AS division_status,
    em.city_id,
    em.sg_code,
    em.department_id,
    em.deleted_at
  FROM ((romsondb.cor_emp_m em
  INNER JOIN romsondb.cor_role_m rol ON em.role = rol.role_id)
  INNER JOIN romsondb.cor_division_m dev ON em.division = dev.division_id)  
  WHERE em.emp_id = '${empid}' AND em.password = '${Password}'`, (err, res) => {
    if (err) {
      console.log(err);
      result({ error: true, data: "Something Went Wrong" });
      return;
    }

    if (res.length == 0) {
      userData = {
        error: true,
        data: "Enter Valid Emp ID & Password"
      }
      result({ userData });
    } else {
      const empStatus = res[0].status;
      if (empStatus === "I") {
        userData = {
          error: true,
          data: "Your ID is blocked, please contact Support Admin"
        }
        result({ userData });
      } else {
        userData = {
          error: false,
          data: res
        }
        result({ userData });
      }
    }
  });
};


auth.changepassword =  (req, result) => {
  const empid = req.body.empid;
  const Password = md5(req.body.Password);
  sql.query(`UPDATE crm_dev_db.cor_emp_m
  SET password ='${Password}'
  WHERE emp_id ='${empid}'`, (err, res) => {

    if(res.length == 0){
      userData = {
        error: true,
        data: "Try After SomeTime"
      }
      result({userData})
    }else{
      userData = {
        error: false,
        data: "Successfully Change Password"
      }
      result({ userData })
    }
  });
};




module.exports = auth;
