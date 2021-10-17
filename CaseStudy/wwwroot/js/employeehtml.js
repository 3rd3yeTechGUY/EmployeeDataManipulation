﻿$(function () { //dentlist.js
    // We need to go to the server  and get our employee data... then store it in session storage so we can do updates

    // build the employee list with that data

    // Allow them to update the employee's data using the modal

    const getAll = async (msg) => {
        try {
            $("#employeeList").text("Finding employee Information...");
            let response = await fetch(`/api/employee`);
            if (response.ok) {
                let payload = await response.json(); //this returns a promise, so we await it
                buildemployeeList(payload);
                msg === "" ? // are we appending to an existing message
                    $("#status").text("employees Loaded") : $("#status").text("${msg} - employees Loaded")
            } else if (response.status !== 404) { //probably some other client side error
                let problemJson = await response.json();
                errorRtn(problemJson, response.status);
            } else {  // else 404 not found
                $("#status").text(error.message);
            } // else
        } catch (error) {
            $("status").text(error.message);
        }
    }; //getAll


    const clearModalFields = () => {
        $("#TextBoxTitle").val("");
        $("#TextBoxFirstName").val("");
        $("#TextBoxLastName").val("");
        $("#TextBoxPhone").val("");
        $("#TextBoxEmail").val("");
        sessionStorage.removeItem("id");
        sessionStorage.removeItem("divisionId");
        sessionStorage.removeItem("timer");
    };//clearModalFields


    //finds the employee id out of the html element that is clicked
    $("#employeeList").click((e) => {
        clearModalFields();
        if (!e) e = window.event;
        let id = e.target.parentNode.id;
        if (id === "employeeList" || id === "") {
            id = e.target.id;
        } // clicked on row somewhere else
        if (id !== "status" && id !== "heading") {
            let data = JSON.parse(sessionStorage.getItem("allemployees"));
            data.map(employee => {
                if (employee.id === parseInt(id)) {
                    $("#TextBoxTitle").val(employee.title);
                    $("#TextBoxFirstname").val(employee.firstname);
                    $("#TextBoxLastname").val(employee.lastname);
                    $("#TextBoxPhone").val(employee.phoneno);
                    $("#TextBoxEmail").val(employee.email);

                    //store sensitive employee information for updating 
                    //option A
                    /*sessionStorage.setItem('employee', JSON.stringify(employee));*/

                    //option B
                    sessionStorage.setItem("id", employee.id);
                    sessionStorage.setItem("divisionId", employee.divisionId);
                    sessionStorage.setItem("timer", employee.timer);


                    $("#modalstatus").text("update data");
                    $("#myModal").modal("toggle");                      // pop up the update toggle window
                } //if
            });//data.map
        } else {
            return false; // ignore if they clicked on heading or status
        }
    }); //employeeListClick


    $("#updatebutton").click(async (e) => {
        try {
            //go get the "current" employee data from session storage
            //set up a new client side instance of employee
            stu = new Object();

            //populate the properties
            //Overwrite with the updated values
            stu.title = $("#TextBoxTitle").val();
            stu.firstname = $("#TextBoxFirstname").val();
            stu.lastname = $("#TextBoxLastname").val();
            stu.phoneno = $("#TextBoxPhone").val();
            stu.email = $("#TextBoxEmail").val();
            stu.divisionName = "";
            stu.picture64 = "";

            //stored earlier, numbers needed for Ids or http 401
            stu.id = parseInt(sessionStorage.getItem("id"));
            stu.divisionId = parseInt(sessionStorage.getItem("divisionId"));
            stu.timer = sessionStorage.getItem("timer");

            //don't have to do ID, Timer, and division Id because they're already stored in employeeObject from before
            //sent the updated back to the server asynchronously using PUT
            let response = await fetch('/api/employee', {
                method: "PUT",
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
                body: JSON.stringify(stu)
            });
            if (response.ok) //or check for response.status
            {
                let responseDate = await response.json();
                $("#status").text(responseDate.msg);
                //getAll(data.msg); // very important !! timer will change. so if we wanna update twice in a row it will fail. so call getAll again for this!!

            } else if (response.status !== 404) { //probably some other client side error
                let problemJson = await response.json();
                errorRtn(problemJson, response.status);
            } else { // else 404 not found
                $("#status").text("no such path on server");
            } //else
        } catch (error) {
            $("#status").text(error.message);
            console.table(error);
        }
    }); // update button click

    const buildemployeeList = (data) => {
        $("#employeeList").empty();  //empty the list first
        div = $(`<div class="list-group-item text-white bg-secondary row d-flex" id="status">employee Info</div>
        <div class= "list-group-item row d-flex text-center" id="heading">
            <div class="col-4 h4">Title</div>
            <div class="col-4 h4">First</div>
            <div class="col-4 h4">Last</div>
        </div>`);
        div.appendTo($("#employeeList"));
        sessionStorage.setItem("allemployees", JSON.stringify(data));
        data.map(stu => {
            btn = $(`<button class="list-group-item row d-flex" id="${stu.id}">`);
            btn.html(`<div class="col-4" id="employeetitle${stu.id}">${stu.title}</div>
            <div class="col-4" id="employeefname${stu.id}">${stu.firstname}</div>
            <div class="col-4" id="employeelastname${stu.id}">${stu.lastname}</div>`
            );
            btn.appendTo($("#employeeList"));
        }); // map
    }; //buildemployeeList
    getAll(""); //first grab the data from the server
}); // jQuery method

// server was reached but server had a problem with the call
const errorRtn = (problemJson, status) => {
    if (status > 499) {
        $("status").text("Problem sever side, see debug console");
    } else {
        let keys = Object.keys(problemJson.errors)
        problem = {
            status: status,
            statusText: problemJson.errors[keys[0]][0], //first error
        };
        $("#status").text("Problem client side, see browser console");
        console.log(problem);
    }
}