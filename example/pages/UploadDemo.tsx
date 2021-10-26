import React from 'react';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/client';

const MUTATION_UPLOAD = gql`
  mutation upload($file: Upload!) {
    upload(file: $file) {
      id
      name
      path
      directory
      size
      mimeType
      createdAt
    }
  }
`;

function UploadDemo() {
  const [mutate] = useMutation(MUTATION_UPLOAD, {
    context: {
      fetchOptions: {
        onUploadProgress: (progress: any) => {
          console.info(progress);
        },
      },
    },
  });

  function onChange({ target: { validity, files } }: any) {
    if (validity.valid) mutate({ variables: { file: files[0] } });
  }

  return <input type="file" multiple required onChange={onChange} />;
}

export default UploadDemo;
