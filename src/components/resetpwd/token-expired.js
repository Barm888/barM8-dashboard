
import './token-expired.css';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';


class TokenExpired extends Component {
    render() {
        return (
            <div className="center">
                <div className="card-1 login-form">
                    <div className="card-body" >
                        <h3 className="card-title text-center"><i class="fas fa-exclamation-triangle"></i> Token Expired</h3>
                        <div className="card-text">
                            <div className="form-group">
                                <span for="email">Sorry, this change password link is not valid. Please <Link className='a-tag' to="/forgot-password"> request another one. </Link></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default TokenExpired;