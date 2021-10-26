import React from 'react';
import styles from './index.css';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client';

import UploadDemo from './UploadDemo';

const CONTINENTS_QUERY = gql`
  query {
    continents: articleChannels {
      code: id
      name: name
    }
  }
`;

export default () => {
  const { data, error, loading } = useQuery(CONTINENTS_QUERY);
  if (error) {
    return <div>Error loading data.</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className={styles.normal}>
      <ul>
        {data.continents.map((c: any) => (
          <li key={c.code}>
            {c.code} - {c.name}
          </li>
        ))}
      </ul>
      <UploadDemo />
    </div>
  );
};
