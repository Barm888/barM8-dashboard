import './reset.css';
import React, { Component } from 'react';
import { toast } from 'react-toastify';
import axios from "axios";


class ReactPwd extends Component {

    constructor(props) {
        toast.configure();
        super(props);
        this.state = {
            email: '', isLoad: false,
            emailError: false,
            isSuccess: false,
            inVaild: false
        }
    }

    emailChange = (e) => {
        this.setState({ email: e.target.value });
        if (this.state.email) this.setState({ emailError: false });
    }

    handleSubmit = (evt) => {
        if (!this.state.email) this.setState({ emailError: true });
        evt.preventDefault();
        if (this.state.emailError === false && this.state.email) {
            let { email } = this.state;
            this.setState({ isLoad: true });
            this.setState({ isSuccess: false });
            axios
                .get(`https://barm8.com.au/api/Businesses/reset_pwd_g_link?params={"email": "${email}"}`)
                .then(result => {
                    if (result && result.data && result.data.data && result.data.data.message == 'Invaild mail address!') {
                        toast.error("Invaild email. Please try agian!");
                        this.setState({ isSuccess: false });
                        this.setState({ inVaild: true });
                        this.setState({ isLoad: false });
                    } else this.setState({ isSuccess: true });
                }).catch((error) => {
                    toast.error(`Error!. Please try again.`);
                    this.setState({ isLoad: false });
                    this.setState({ isSuccess: false });
                });
        } else {
            toast.error("Please try again!");
            this.setState({ isLoad: false });
            this.setState({ isSuccess: false });
        }
    }

    render() {
        const { email, isSuccess } = this.state;
        return (
            <div >
                {
                    isSuccess === false ? <div className="center">
                        <div className="card login-form">
                            <div className="card-body" >
                                <h3 className="card-title text-center">Forgot password</h3>
                                <div className="card-text">
                                    <form className="form-1" id='reset-form' onSubmit={this.handleSubmit}>
                                        <div className="form-group">
                                            <label for="email">Enter your email address and we will send you a link to reset your password.</label>
                                            <br />
                                            <input type="email" name="firstName" value={email} id="email"
                                                onChange={this.emailChange} className="form-control" placeholder="name@example.com" />
                                            {this.state.emailError ? <span style={{ color: "red" }}>Email is required!</span> : ''}
                                            {this.state.inVaild ? <span style={{ color: "red" }}>Invaild email!</span> : ''}
                                        </div>
                                        {
                                            this.state.isLoad == false ?
                                                <div >
                                                    <button className='btn btn-primary btn-block' type="submit">Send password reset email</button>
                                                </div> :
                                                <div >
                                                    <button className='btn btn-primary btn-block' type="button" disabled="disabled">Loading...</button>
                                                </div>
                                        }
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div> : <MailSend email={email} />
                }

            </div>

        );
    }
}


class MailSend extends Component {

    constructor(props) {
        toast.configure();
        super(props);
        toast.success(`Successfully sent!`);
    }

    render() {
        return (
            <div className="center">
                <div className="card login-form">
                    <div className="card-body" >
                        <h3 className="card-title text-center">Email Sent</h3>
                        <div className="card-text">
                            <div class="login-content"><div>
                                <p id="" data-uia="email_sent_note">An email with instructions on how to reset your password has been sent to <b>{this.props.email}</b>. Check your spam or junk folder if you don’t see the email in your inbox.</p><p>If you no longer have access to this email account, please <a class="contact-us-link" data-uia="contact-us-link" href="https://barm8.com.au/contact" target="_blank"> contact us </a>.</p></div></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}


export default ReactPwd;