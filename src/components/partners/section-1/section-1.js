import './section-1.css';
import React, { Component } from 'react';

export default class PSection1 extends Component {

    componentDidMount() {
        const script = document.createElement("script");
        script.src = "./partner.js";
        script.async = true;
        document.body.appendChild(script);
    }

    render() {
        return (
            <div id='partners-section-1'>
                <div className='container'>
                    <div className='row' id='main-section'>
                        <div className='col-lg-7'>
                            <div className='left-content'>
                                <h1>Put your venue in the pocket
                                    of patrons everywhere.</h1>
                                <h4>BarM8 showcases the best of your venue – its vibe, offers and events – to local users, driving new and existing patrons to your door, more often.</h4>
                                <a href="#contact"><button className='btn btn-primary'>Become a BarM8 Partner</button></a>
                            </div>
                        </div>
                        <div className='col-lg-5'>
                            <div class='left-image'>
                                <img src='https://barm8-space1.sgp1.cdn.digitaloceanspaces.com/default-img/landingiPhone.png' />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}