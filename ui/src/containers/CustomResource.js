import React, { useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import { injectIntl } from 'react-intl';
import { Table, Button } from '@scality/core-ui';
import { padding } from '@scality/core-ui/dist/style/theme';
import { sortSelector } from '../services/utils';
import NoRowsRenderer from '../components/NoRowsRenderer';

const PageContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: ${padding.base};
`;

const ActionContainer = styled.div`
  margin-bottom: ${padding.base};
  display: flex;
  align-items: center;
  .sc-button {
    margin-right: 15px;
  }
`;

const TableContainer = styled.div`
  flex-grow: 1;
  display: flex;
`;

const TableWrapper = styled.div`
  width: 50%;
  flex-grow: 1;
  margin: 10px 30px;
  height: 500px;
`;

const TableTitle = styled.label`
  font-weight: bold;
  font-size: 16px;
  margin: 5px 0;
  display: block;
`;

const CustomResource = props => {
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('ASC');
  const { intl, history, customResource, deployement } = props;
  const columns = [
    {
      label: intl.messages.name,
      dataKey: 'name',
      flexGrow: 1
    },
    {
      label: intl.messages.namespace,
      dataKey: 'namespace'
    },
    {
      label: intl.messages.replicas,
      dataKey: 'replicas',
      width: 100
    },
    {
      label: intl.messages.version,
      dataKey: 'version',
      flexGrow: 1
    }
  ];

  const columnsDeployement = [
    {
      label: intl.messages.name,
      dataKey: 'name',
      flexGrow: 1
    },
    {
      label: intl.messages.namespace,
      dataKey: 'namespace',
      width: 150
    },
    {
      label: 'image',
      dataKey: 'image',
      flexGrow: 1
    },
    {
      label: intl.messages.version,
      dataKey: 'version',
      width: 100
    }
  ];

  const onSort = ({ sortBy, sortDirection }) => {
    setSortBy(sortBy);
    setSortDirection(sortDirection);
  };

  const customResourceSortedList = sortSelector(
    customResource.list,
    sortBy,
    sortDirection
  );

  const deployementSortedList = sortSelector(
    deployement.list,
    sortBy,
    sortDirection
  );

  return (
    <PageContainer>
      <ActionContainer>
        <Button
          text={intl.messages.create_new_namespaces}
          onClick={() => history.push('/namespaces/create')}
          icon={<i className="fas fa-plus" />}
        />
        <Button
          text={intl.messages.create_new_customResource}
          onClick={() => history.push('/customResource/create')}
          icon={<i className="fas fa-plus" />}
        />
      </ActionContainer>
      <TableContainer>
        <TableWrapper>
          <TableTitle>Custom Resources </TableTitle>
          <Table
            list={customResourceSortedList}
            columns={columns}
            disableHeader={false}
            headerHeight={40}
            rowHeight={40}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={onSort}
            onRowClick={row => {
              history.push(`/customResource/${row.rowData.name}/edit`);
            }}
            noRowsRenderer={() => (
              <NoRowsRenderer content={intl.messages.no_data_available} />
            )}
          />
        </TableWrapper>
        <TableWrapper>
          <TableTitle>Deployments</TableTitle>
          <Table
            list={deployementSortedList}
            columns={columnsDeployement}
            disableHeader={false}
            headerHeight={40}
            rowHeight={40}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={onSort}
            onRowClick={row => {
              history.push(`/deployment/${row.rowData.name}/edit`);
            }}
            noRowsRenderer={() => (
              <NoRowsRenderer content={intl.messages.no_data_available} />
            )}
          />
        </TableWrapper>
      </TableContainer>
    </PageContainer>
  );
};

function mapStateToProps(state) {
  return {
    customResource: state.app.customResource,
    deployement: state.app.deployement
  };
}

export default injectIntl(withRouter(connect(mapStateToProps)(CustomResource)));
