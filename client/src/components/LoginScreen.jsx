import React from 'react';
import TextField from 'material-ui/TextField';
import Logo from './Logo';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import PropTypes from 'prop-types';

// https://stackoverflow.com/questions/396145/how-to-vertically-center-a-div-for-all-browsers?page=1&tab=votes#tab-top
// https://stackoverflow.com/questions/1575141/make-div-100-height-of-browser-window
const style = {
  master: {
    textAlign: 'center',
    height: '100vh',
    width: '100vw',
    display: 'table',
    position: 'absolute',
  },
  masterMiddle: {
    display: 'table-cell',
    verticalAlign: 'middle',
  },
  masterInner: {
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  loginButton: {
    marginTop: '30px',
  },
  error: {
    color: 'red',
    marginTop: '20px',
  },
};

/**
 * Login screen shown when locally no valid login is found
 */
class LoginScreen extends React.Component {
  constructor() {
    super();
    this.onLoginClick = this.onLoginClick.bind(this);
    this.state = {
      user: '',
      password: '',
      error: false,
    };
  }

  /**
   * Calls the login function passed in the props and sets state of the error
   */
  async onLoginClick() {
    const result = await this.props.login(this.state.user, this.state.password);
    this.setState({
      error: !result,
    });
  }

  render() {
    const errorMessage = this.state.error ? 'Wrong user or password.' : '';
    return (
      <div style={style.master}>
        <div style={style.masterMiddle}>
          <div style={style.masterInner}>
            <Logo />
            <Typography gutterBottom style={style.error}>
              {errorMessage}
            </Typography>
            <TextField
              id="user"
              label="User name"
              value={this.state.name}
              onChange={event => this.setState({ user: event.target.value })}
              margin="normal"
            />
            <br />
            <TextField
              id="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              onChange={event => this.setState({ password: event.target.value })}
              margin="normal"
            />
            <br />
            <Button style={style.loginButton} raised onClick={this.onLoginClick}>
              Login
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

LoginScreen.propTypes = {
  login: PropTypes.func,
};

export default LoginScreen;
