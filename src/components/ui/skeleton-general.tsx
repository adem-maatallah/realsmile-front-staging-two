// SkeletonGeneral.tsx
export const SkeletonGeneral = ({
  className,
  style,
  rounded = false,
}: {
  className?: string;
  style?: React.CSSProperties;
  rounded?: boolean;
}) => (
  <div className={`animate-pulse ${className}`} style={style}>
    {rounded ? (
      <div
        className="rounded-full bg-gray-300"
        style={{ ...RoundededDefaultStyles, ...style }}
      />
    ) : (
      <div
        className={`rounded bg-gray-300`}
        style={{ ...defaultStyles, ...style }}
      />
    )}
  </div>
);

const defaultStyles: React.CSSProperties = {
  width: '100%',
  height: '100%',
  borderRadius: '4px', // Default to rectangular with slight rounding
};

const RoundededDefaultStyles: React.CSSProperties = {
  width: '100%',
  height: '100%',
  borderRadius: '50%',
};
