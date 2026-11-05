// The ONE seam where cloud sync (Firebase etc.) will attach later. Standalone app uses the no-op adapter.
// Rules for any future adapter: tier A may sync, tier B only per-module opt-in, tier C never (docs/03 §2).
export const NoopAdapter={name:"none",enabled:false,async push(){},async pull(){return[]}};
let current=NoopAdapter;
export const getAdapter=()=>current;
export const setAdapter=a=>{current=a||NoopAdapter};
