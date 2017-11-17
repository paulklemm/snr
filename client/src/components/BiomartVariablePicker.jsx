import React from 'react';
import List, { ListItem, ListItemSecondaryAction, ListItemText } from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';
import Paper from 'material-ui/Paper';
import Button from 'material-ui/Button';
import { Icon } from 'react-fa';
import Loading from './Loading';

class BiomartVariablePicker extends React.Component {
  /**
   * Invert selected state of biomart variable
   * 
   * @param {Event} event Click event
   * @param {string} biomartVariable Biomart variable name
   */
  checkboxClick(event, biomartVariable) {
    event.stopPropagation();
    this.props.setBiomartVariableSelection(
      biomartVariable,
      !this.props.biomartVariables[biomartVariable],
    );
  }

  /**
   * Get list of Biomart variables
   */
  renderListItems() {
    const biomartVariableKeys = Object.keys(this.props.biomartVariables);
    if (biomartVariableKeys.length === 0) {
      return <Loading key="CircularProgress_getBiomartVariablesCheckboxes" />;
    }
    const listItems = biomartVariableKeys.map(biomartVariable => (
      <ListItem
        key={biomartVariable}
        dense
        button
        onClick={event => this.checkboxClick(event, biomartVariable)}
      >
        <ListItemText primary={biomartVariable} />
        <ListItemSecondaryAction>
          <Checkbox
            onChange={event => this.checkboxClick(event, biomartVariable)}
            checked={this.props.biomartVariables[biomartVariable]}
          />
        </ListItemSecondaryAction>
      </ListItem>
    ));
    return (
      <Paper>
        <List>{listItems}</List>
        <Button
          style={{ marginLeft: '15px', marginBottom: '15px' }}
          raised
          onClick={this.props.redownloadData}
        >
          <Icon name="download" style={{ marginRight: '5px' }} />
          Redownload Data
        </Button>
      </Paper>
    );
  }

  render() {
    return this.renderListItems();
  }
}

export default BiomartVariablePicker;
