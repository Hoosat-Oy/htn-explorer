import React from 'react';
import './SkeletonLoader.scss';

export const CardSkeleton = () => {
  return (
    <div className="bg-hoosat-slate/50 backdrop-blur-lg p-8 rounded-2xl border border-slate-700 h-full w-full">
      {/* Icon and Title Skeleton */}
      <div className="flex items-center gap-4 mb-6">
        <div className="skeleton skeleton-icon w-16 h-16 rounded-xl flex-shrink-0" />
        <div className="skeleton skeleton-text" style={{ width: '150px', height: '28px' }} />
      </div>

      {/* Content Skeleton */}
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="skeleton skeleton-text" style={{ width: '100px', height: '16px' }} />
            <div className="skeleton skeleton-text" style={{ width: '120px', height: '20px' }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export const TableSkeleton = ({ lines = 12 }) => {
  return (
    <div className="block-overview-content">
      <table className="styled-table w-100">
        <thead>
          <tr>
            <th><div className="skeleton skeleton-text" style={{ width: '80px', height: '16px' }} /></th>
            <th><div className="skeleton skeleton-text" style={{ width: '60px', height: '16px' }} /></th>
            <th width="100%"><div className="skeleton skeleton-text" style={{ width: '100px', height: '16px' }} /></th>
          </tr>
        </thead>
        <tbody>
          {[...Array(lines)].map((_, index) => (
            <tr key={index}>
              <td><div className="skeleton skeleton-text" style={{ width: '140px', height: '16px' }} /></td>
              <td><div className="skeleton skeleton-text" style={{ width: '30px', height: '16px' }} /></td>
              <td><div className="skeleton skeleton-text" style={{ width: '100%', height: '16px' }} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const TxTableSkeleton = ({ lines = 12 }) => {
  return (
    <div className="block-overview-content">
      <table className="styled-table w-100">
        <thead>
          <tr>
            <th><div className="skeleton skeleton-text" style={{ width: '60px', height: '16px' }} /></th>
            <th><div className="skeleton skeleton-text" style={{ width: '80px', height: '16px' }} /></th>
            <th width="100%"><div className="skeleton skeleton-text" style={{ width: '100px', height: '16px' }} /></th>
          </tr>
        </thead>
        <tbody>
          {[...Array(lines)].map((_, index) => (
            <tr key={index}>
              <td><div className="skeleton skeleton-text" style={{ width: '80px', height: '16px' }} /></td>
              <td><div className="skeleton skeleton-text" style={{ width: '100px', height: '16px' }} /></td>
              <td><div className="skeleton skeleton-text" style={{ width: '100%', height: '16px' }} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const TransactionListSkeleton = ({ lines = 5 }) => {
  return (
    <>
      {[...Array(lines)].map((_, index) => (
        <div key={index} style={{ marginBottom: '2rem' }}>
          {/* Timestamp row */}
          <div className="d-flex align-items-center mb-2">
            <div className="skeleton skeleton-text" style={{ width: '180px', height: '18px' }} />
          </div>

          {/* Transaction details row */}
          <div className="d-flex flex-wrap gap-3">
            {/* Transaction ID */}
            <div style={{ flex: '1 1 400px' }}>
              <div className="skeleton skeleton-text mb-2" style={{ width: '100px', height: '14px' }} />
              <div className="skeleton skeleton-text" style={{ width: '100%', height: '16px' }} />
            </div>

            {/* Amount */}
            <div style={{ flex: '0 1 150px' }}>
              <div className="skeleton skeleton-text mb-2" style={{ width: '60px', height: '14px' }} />
              <div className="skeleton skeleton-text" style={{ width: '120px', height: '18px' }} />
            </div>

            {/* Value */}
            <div style={{ flex: '0 1 120px' }}>
              <div className="skeleton skeleton-text mb-2" style={{ width: '40px', height: '14px' }} />
              <div className="skeleton skeleton-text" style={{ width: '100px', height: '18px' }} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export const UtxoListSkeleton = ({ lines = 5 }) => {
  return (
    <>
      {[...Array(lines)].map((_, index) => (
        <div key={index} style={{ marginBottom: '2rem' }}>
          {/* Timestamp row */}
          <div className="d-flex align-items-center mb-2">
            <div className="skeleton skeleton-text" style={{ width: '180px', height: '18px' }} />
          </div>

          {/* UTXO details row */}
          <div className="d-flex flex-wrap gap-3">
            {/* Transaction ID */}
            <div style={{ flex: '1 1 200px' }}>
              <div className="skeleton skeleton-text mb-2" style={{ width: '100px', height: '14px' }} />
              <div className="skeleton skeleton-text" style={{ width: '100%', height: '16px' }} />
            </div>

            {/* Amount */}
            <div style={{ flex: '1 1 150px' }}>
              <div className="skeleton skeleton-text mb-2" style={{ width: '60px', height: '14px' }} />
              <div className="skeleton skeleton-text" style={{ width: '120px', height: '18px' }} />
            </div>

            {/* Value */}
            <div style={{ flex: '1 1 120px' }}>
              <div className="skeleton skeleton-text mb-2" style={{ width: '40px', height: '14px' }} />
              <div className="skeleton skeleton-text" style={{ width: '100px', height: '18px' }} />
            </div>

            {/* Index */}
            <div style={{ flex: '1 1 100px' }}>
              <div className="skeleton skeleton-text mb-2" style={{ width: '40px', height: '14px' }} />
              <div className="skeleton skeleton-text" style={{ width: '60px', height: '18px' }} />
            </div>

            {/* Block DAA Score */}
            <div style={{ flex: '1 1 150px' }}>
              <div className="skeleton skeleton-text mb-2" style={{ width: '110px', height: '14px' }} />
              <div className="skeleton skeleton-text" style={{ width: '100px', height: '18px' }} />
            </div>

            {/* Details */}
            <div style={{ flex: '1 1 100px' }}>
              <div className="skeleton skeleton-text mb-2" style={{ width: '50px', height: '14px' }} />
              <div className="skeleton skeleton-text" style={{ width: '80px', height: '18px' }} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};
