import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import { injectIntl } from 'react-intl';
import { Table, Button } from '@scality/core-ui';
import { padding } from '@scality/core-ui/dist/style/theme';
import { sortSelector } from '../services/utils';
import NoRowsRenderer from '../components/NoRowsRenderer';
import { fetchCustomResourceAction } from '../ducks/app/customResource';
import { fetchNamespacesAction } from '../ducks/app/namespaces';

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
`;

const CustomResource = props => {
  useEffect(() => {
    props.fetchNamespaces();
    props.fetchCustomResource();
  });

  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('ASC');
  const { intl, history, customResource } = props;
  const columns = [
    {
      label: intl.messages.name,
      dataKey: 'name',
      flexGrow: 1
    },
    {
      label: intl.messages.status,
      dataKey: 'status'
    },
    {
      label: intl.messages.deployment,
      dataKey: 'deployment'
    },
    {
      label: intl.messages.roles,
      dataKey: 'roles',
      flexGrow: 1
    },
    {
      label: intl.messages.version,
      dataKey: 'metalk8s_version'
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
        <Table
          list={customResourceSortedList}
          columns={columns}
          disableHeader={false}
          headerHeight={40}
          rowHeight={40}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={onSort}
          onRowClick={() => {}}
          noRowsRenderer={() => (
            <NoRowsRenderer content={intl.messages.no_data_available} />
          )}
        />
      </TableContainer>
    </PageContainer>
  );
};

function mapStateToProps(state) {
  return {
    customResource: state.app.customResource
  };
}

const mapDispatchToProps = dispatch => {
  return {
    fetchNamespaces: () => dispatch(fetchNamespacesAction()),
    fetchCustomResource: () => dispatch(fetchCustomResourceAction())
  };
};

export default injectIntl(
  withRouter(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(CustomResource)
  )
);
