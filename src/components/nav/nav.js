import './nav.css';
import { NavLink } from 'react-router-dom';

function Nav() {
    return (
        <nav className="navbar fixed-top navbar-expand-lg" id='navbar'>
            <NavLink class="navbar-brand" to='/'><img src="./logo.png" /></NavLink>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav ml-auto">
                    <li className="nav-item">
                        <div className="nav-link"><NavLink to='/partners'>For Business</NavLink></div>
                    </li>
                    <li className="nav-item">
                        <div className="nav-link"><NavLink to='/login'>Login</NavLink></div>
                    </li>
                    {/* <li className="nav-item">
                        <div className="nav-link"><NavLink to='/about'>About</NavLink></div>
                    </li>
                    <li className="nav-item">
                        <div className="nav-link"><NavLink to='/faq'>FAQ</NavLink></div>
                    </li>
                    <li className="nav-item">
                        <div className="nav-link"><NavLink to='/partners'>Partners</NavLink></div>
                    </li> */}
                </ul>
            </div>
        </nav>
    )
}

export default Nav;