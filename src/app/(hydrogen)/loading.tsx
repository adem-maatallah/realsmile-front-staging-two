import React from 'react';
import styles from './loading-spinner.module.css';
import Image from 'next/image';

const LoadingSpinner = () => {
  return (
    <div className={styles['loading-spinner-overlay']}>
      <div>
        <Image
          src="/assets/loading.gif"
          alt="Loading spinner"
          width={300}
          height={300}
        />
      </div>
    </div>
  );
};

export default LoadingSpinner;
