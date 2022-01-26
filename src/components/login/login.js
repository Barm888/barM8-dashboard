import './login.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React, { Component } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';


class Login extends Component {

    constructor(props) {
        toast.configure();
        super(props);
        this.state = { email: '', password: '', isLoad: false, emailErr: false, passwordErr: false, vaildEmail: false }
    }

    emailOnChange = (e) => {
        this.setState({ email: e.target.value });
        if (this.state.email) this.setState({ emailErr: false });
    }

    passwordOnChange = (e) => {
        this.setState({ password: e.target.value });
        if (this.state.password) this.setState({ passwordErr: false });
    }

    handleSubmit = (evt) => {

        function validateEmail(email) {
            var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            return regex.test(email);
        }

        evt.preventDefault();
        if (!this.state.email) this.setState({ emailErr: true });
        if (!this.state.password) this.setState({ passwordErr: true });
        if (this.state.email) {
            if (validateEmail(this.state.email)) {
                if (this.state.password) {
                    axios
                        .get(`https://www.barm8.com.au/api/Businesses/userLogin?params={"email":"${this.state.email}", "password": "${this.state.password}"}`)
                        .then(result_1 => {
                            if (result_1 && result_1.data && result_1.data.data) {
                                let { isSuccess, result } = result_1.data.data;
                                if (isSuccess) {
                                    let isAdmin = (this.state.email == 'admin@barm8.com.au' ? true : false);
                                    let userDetails = {
                                        "id": result.userId,
                                        "tokenId": result.id,
                                        "email": this.state.email,
                                        "businessName": result.business.businessName,
                                        "loginId": result.userId, isAdmin
                                    };
                                    localStorage.removeItem("userSession");
                                    localStorage.setItem("userSession", JSON.stringify(userDetails));
                                    var link = document.createElement('a');
                                    if (isAdmin) link.href = "/admin";
                                    else link.href = "/dashboard-home";
                                    document.body.appendChild(link);
                                    link.click();
                                } else {
                                    toast.error("Invaild email or password. Please try again!");
                                }
                            } else {
                                toast.error("Invaild email or password. Please try again!");
                            }
                        }).catch((error) => {
                            toast.error("Error!. Please try again.");
                        });
                } else toast.error("Password is required!");
            } else {
                this.setState({ vaildEmail: true });
            }
        }
    }

    render() {
        const { email, password, emailErr, passwordErr, vaildEmail } = this.state;
        return (<div className="container-fluid login-outer ng-scope" id="loginCtl" ng-controller="loginCtl">
            <div className="login-box">
                <div className="header-text">
                    <div className="logo-section">
                        <a href="/"><img src="https://barm8-space1.sgp1.digitaloceanspaces.com/default-img/logo-l.png" /></a>
                    </div>
                    <div className="form-section text-center">
                        <h2>Welcome back!</h2>
                        <p className="">Sign in to access and manage your venue’s details on the BarM8 </p>
                        <form className="ng-pristine ng-valid" autocomplete="off" onSubmit={this.handleSubmit}>
                            <div className="cc-form">
                                <div class="form-group">
                                    <input type="email" className="form-control" value={email}
                                        onChange={this.emailOnChange} placeholder="Email Address" name="email"
                                        id="email" autocomplete="off" />
                                    {emailErr ? <span style={{ color: "red" }}>Email is Required!</span> : ''}
                                </div>
                                <div class="form-group">
                                    <input type="password" value={password}
                                        onChange={this.passwordOnChange} className="form-control" placeholder="Password" name="password" id="password" autocomplete="off" />
                                    {passwordErr ? <span style={{ color: "red" }}>Password is required!</span> : ''}
                                </div>
                                <span className="psw">
                                    <NavLink to="/forgot-password">Forgot your password?</NavLink>
                                </span>
                                <button type="submit">Login</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>)
    }
}

export default Login;