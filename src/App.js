import React, { Component } from 'react';
import './App.css';
import { Switch, Route } from 'react-router-dom';
import Nav from './components/nav/nav.js'
import Footer from './components/footer/footer.js'
import PSection1 from './components/partners/section-1/section-1.js'
import PSection2 from './components/partners/section-2/section-2.js'
import PSection3 from './components/partners/section-3/section-3.js'
import PSection4 from './components/partners/section-4/section-4.js'
import Section1 from './components/section-1/section-1.js'
import Section2 from './components/section-2/section-2.js'
import Section3 from './components/section-3/section-3.js'
import Section4 from './components/section-4/section-4.js'
import Contact from './components/general/contact/contact.js'
import ResetPwd from './components/resetpwd/resetpwd.js';
import TokenExpired from './components/resetpwd/token-expired.js';
import Login from './components/login/login.js';

class Home extends Component {
    render() {
        return (<div className='app'>
            <Nav />
            <div>
                <div id='top'></div>
                <Section1 />
                <Section2 />
                <Section3 />
                <Section4 />
            </div>
            <Footer />
        </div>)
    }
}

class Partners extends Component {
    render() {
        return (<div className='app'>
            <Nav />
            <div id='partners'>
                <PSection1 />
                <PSection2 />
                <PSection3 />
                <PSection4 />
                <Contact />
            </div>
            <Footer />
        </div>)
    }
}

class ForgotPwd extends Component {
    render() {
        return (<div className='app'>
            <Nav />
            <div id='reset-password'>
                <ResetPwd />
            </div>
            <Footer />
        </div>)
    }
}

class TokenExp extends Component {
    render() {
        return (<div className='app'>
            <Nav />
            <div id='token-expired'>
                <TokenExpired />
            </div>
            <Footer />
        </div>)
    }
}


class App extends Component {
    render() {
        return (
            <div>
                <Switch>
                    <Route exact path='/'>
                        <Home />
                    </Route>
                    <Route path='/partners'>
                        <Partners />
                    </Route>
                    <Route path='/forgot-password'>
                        <ForgotPwd />
                    </Route>
                    <Route path='/token-expired'>
                        <TokenExp />
                    </Route>
                    <Route path='/login'>
                        <Login />
                    </Route>
                </Switch>
            </div>
        );
    }
}

export default App;