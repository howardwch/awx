import React, { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { func, shape } from 'prop-types';
import { InventorySourcesAPI } from '../../../../../../api';
import { getQSConfig, parseQueryString } from '../../../../../../util/qs';
import useRequest from '../../../../../../util/useRequest';
import PaginatedDataList from '../../../../../../components/PaginatedDataList';
import DataListToolbar from '../../../../../../components/DataListToolbar';
import CheckboxListItem from '../../../../../../components/CheckboxListItem';

const QS_CONFIG = getQSConfig('inventory_sources', {
  page: 1,
  page_size: 5,
  order_by: 'name',
});

function InventorySourcesList({ i18n, nodeResource, onUpdateNodeResource }) {
  const location = useLocation();

  const {
    result: { inventorySources, count },
    error,
    isLoading,
    request: fetchInventorySources,
  } = useRequest(
    useCallback(async () => {
      const params = parseQueryString(QS_CONFIG, location.search);
      const results = await InventorySourcesAPI.read(params);
      return {
        inventorySources: results.data.results,
        count: results.data.count,
      };
    }, [location]),
    {
      inventorySources: [],
      count: 0,
    }
  );

  useEffect(() => {
    fetchInventorySources();
  }, [fetchInventorySources]);

  return (
    <PaginatedDataList
      contentError={error}
      hasContentLoading={isLoading}
      itemCount={count}
      items={inventorySources}
      onRowClick={row => onUpdateNodeResource(row)}
      qsConfig={QS_CONFIG}
      showPageSizeOptions={false}
      renderItem={item => (
        <CheckboxListItem
          isSelected={!!(nodeResource && nodeResource.id === item.id)}
          itemId={item.id}
          key={item.id}
          name={item.name}
          label={item.name}
          onSelect={() => onUpdateNodeResource(item)}
          onDeselect={() => onUpdateNodeResource(null)}
          isRadio
        />
      )}
      renderToolbar={props => <DataListToolbar {...props} fillWidth />}
      toolbarSearchColumns={[
        {
          name: i18n._(t`Name`),
          key: 'name',
          isDefault: true,
        },
        {
          name: i18n._(t`Source`),
          key: 'source',
          options: [
            [`file`, i18n._(t`File, directory or script`)],
            [`scm`, i18n._(t`Sourced from a project`)],
            [`ec2`, i18n._(t`Amazon EC2`)],
            [`gce`, i18n._(t`Google Compute Engine`)],
            [`azure_rm`, i18n._(t`Microsoft Azure Resource Manager`)],
            [`vmware`, i18n._(t`VMware vCenter`)],
            [`satellite6`, i18n._(t`Red Hat Satellite 6`)],
            [`openstack`, i18n._(t`OpenStack`)],
            [`rhv`, i18n._(t`Red Hat Virtualization`)],
            [`tower`, i18n._(t`Ansible Tower`)],
          ],
        },
      ]}
      toolbarSortColumns={[
        {
          name: i18n._(t`Name`),
          key: 'name',
        },
      ]}
    />
  );
}

InventorySourcesList.propTypes = {
  nodeResource: shape(),
  onUpdateNodeResource: func.isRequired,
};

InventorySourcesList.defaultProps = {
  nodeResource: null,
};

export default withI18n()(InventorySourcesList);
