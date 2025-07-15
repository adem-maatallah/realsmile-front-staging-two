export const initialState = {
  items: [],
};

export function cartReducer(state, action) {
  switch (action.type) {
    case 'SET_CART':
      return { ...state, items: action.items };

    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.item],
      };

    case 'MODIFY_QUANTITY':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.productId
            ? { ...item, quantity: action.quantity }
            : item
        ),
      };

    case 'CLEAR_CART':
      return initialState;

    default:
      return state;
  }
}
