// skeleton-row.tsx
export const SkeletonRow = ({ columns }:any) => (
  <div className="rc-table-row">
    {columns.map((_:any, index:any) => (
      <div key={index} className="rc-table-cell">
        <div style={classes.skeleton} />
      </div>
    ))}
  </div>
);

const classes = {
  skeleton: {
    height: '45px',
    backgroundColor: '#ececec',
    margin: '10px 0',
    borderRadius: '4px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
};
