import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Table } from '@scality/core-ui';
import { fetchNodesAction } from '../ducks/app/nodes';

const NodeList = props => {
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('ASC');
  const [sortedList, setSortedList] = useState([]);

  const columns = [
    {
      label: 'Name',
      dataKey: 'name',
      disableSort: false
    },
    {
      label: 'Capacity CPU',
      dataKey: 'cpu',
      disableSort: false
    },
    {
      label: 'Memory',
      dataKey: 'memory',
      disableSort: false
    },
    {
      label: 'Number of pods',
      dataKey: 'pods',
      disableSort: true
    }
  ];

  useEffect(() => {
    props.fetchNodes();
  }, []);

  const onSort = ({ sortBy, sortDirection }) => {
    const list = props.nodes.sort(function(a, b) {
      var nameA = a[sortBy].toString().toUpperCase(); // ignore upper and lowercase
      var nameB = b[sortBy].toString().toUpperCase(); // ignore upper and lowercase
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });

    if (sortDirection === 'DESC') {
      list.reverse();
    }

    setSortBy(sortBy);
    setSortDirection(sortDirection);
    setSortedList(list);
  };

  return (
    <Table
      list={sortedList}
      columns={columns}
      disableHeader={false}
      headerHeight={40}
      rowHeight={40}
      sortBy={sortBy}
      sortDirection={sortDirection}
      onSort={onSort}
      onRowClick={() => {}}
    />
  );
};

function mapStateToProps(state) {
  return {
    nodes: state.nodes.list
  };
}

const mapDispatchToProps = dispatch => {
  return {
    fetchNodes: () => dispatch(fetchNodesAction())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NodeList);
