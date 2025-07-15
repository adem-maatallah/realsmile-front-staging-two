import React, { forwardRef } from 'react';
import { Input as OriginalInput } from 'rizzui';

const Input = forwardRef((props, ref) => (
  <OriginalInput ref={ref} {...props} />
));

export default Input;
