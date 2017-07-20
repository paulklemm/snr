import React from 'react';

// From https://gist.github.com/yamadayuki/f1ea9ccacad7f1c140457b5877fb54cc
const injectStyle = (style) => {
  const styleElement = document.createElement('style');
  let styleSheet = null;
  document.head.appendChild(styleElement);
  styleSheet = styleElement.sheet;
  styleSheet.insertRule(style, styleSheet.cssRules.length);
};

const styleSheet = {
  spinnerParent: {
    // margin: '5px',
    width: '100px',
    height: '50px',
    position: 'relative',
    fontSize: '30px',
    color: '#333',
    fontFamily: "Helvetica Neue",
    fontWeight: "lighter"
  },
  dot: {
    fontSize: '30px',
    marginLeft: '1px',
    marginRight: '1px'
  },
  spinner: {
    left: '-0.9px',
    top: '-1.8px',
    width: '40px',
    height: '40px',
    display: 'inline-block',
    position: 'absolute',
    backgroundColor: '#333',
    borderRadius: '100%',  
    WebkitAnimation: 'sk-scaleout 1.0s infinite ease-in-out',
    animation: 'sk-scaleout 1.0s infinite ease-in-out'
  }
};

const skScaleout = `
  @-webkit-keyframes sk-scaleout {
    0% { -webkit-transform: scale(0) }
    100% {
      -webkit-transform: scale(1.0);
      opacity: 0;
    }
  }
`;

const skScaleoutFrames = `
  @keyframes sk-scaleout {
    0% { 
      -webkit-transform: scale(0);
      transform: scale(0);
    } 100% {
      -webkit-transform: scale(1.0);
      transform: scale(1.0);
      opacity: 0;
    }
  }
`;

injectStyle(skScaleout)
injectStyle(skScaleoutFrames)

class Logo extends React.Component {
  render() {
    let spinner = "";
    spinner = (this.props.pulse) ? <span style={styleSheet.spinner}></span> : "";
    return(
      <div style={styleSheet.spinnerParent}>
        s<span style={styleSheet.dot}>·</span>{spinner}nr
      </div>
    )
  }
}

export default Logo;