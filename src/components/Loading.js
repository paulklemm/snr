import React from 'react';
import { CircularProgress } from 'material-ui/Progress';

// const styleSheet = {
// 	progress: {
// 		marginLeft: 'auto',
// 		marginRight: 'auto',
// 		marginTop: 10,
// 		marginBottom: 10,
// 		width: 40,
// 		height: 40
// 	}
// };

class Loading extends React.Component{
	render() {
		return (
			<div style={{ 
				width: `${this.props.width}px`, 
				height: `${this.props.height}px`,
				display: 'flex',
				justifyContent:'center',
				alignItems:'center'
			}}>
				<CircularProgress />
			</div>
		);
	}
}

export default Loading;