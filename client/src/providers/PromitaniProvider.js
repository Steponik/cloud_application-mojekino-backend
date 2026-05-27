import { createContext, useContext, useEffect, useState } from "react";
import FetchHelper from "../fetch-helper";

export const PromitaniContext = createContext();

const initialValue = {
  state: "pending",
  data: [],
  handlerMap: {},
  errorData: null,
};

function PromitaniProvider({ children }) {
  const [promitaniDto, setPromitaniDto] = useState(initialValue);

  async function loadList() {
    setPromitaniDto((current) => ({
      ...current,
      state: "pending",
      errorData: null,
    }));
    const result = await FetchHelper.promitani.list();
    setPromitaniDto((current) => {
      if (result.ok) {
        return {
          ...current,
          state: "ready",
          data: result.data,
          errorData: null,
        };
      }
      return {
        ...current,
        state: "error",
        errorData: result.data,
      };
    });
  }

  useEffect(() => {
    loadList();
  }, []);

  async function createItem(dtoIn) {
    const result = await FetchHelper.promitani.create(dtoIn);
    if (result.ok) {
      setPromitaniDto((current) => ({
        ...current,
        state: "ready",
        data: [...current.data, result.data].sort(comparePromitani),
        errorData: null,
      }));
      return { ok: true, data: result.data };
    }
    return { ok: false, errorData: result.data };
  }

  async function updateItem(dtoIn) {
    const result = await FetchHelper.promitani.update(dtoIn);
    if (result.ok) {
      setPromitaniDto((current) => ({
        ...current,
        state: "ready",
        data: current.data
          .map((item) => (item.id === result.data.id ? result.data : item))
          .sort(comparePromitani),
        errorData: null,
      }));
      return { ok: true, data: result.data };
    }
    return { ok: false, errorData: result.data };
  }

  async function deleteItem(dtoIn) {
    const result = await FetchHelper.promitani.delete(dtoIn);
    if (result.ok) {
      setPromitaniDto((current) => ({
        ...current,
        state: "ready",
        data: current.data.filter((item) => item.id !== dtoIn.id),
        errorData: null,
      }));
      return { ok: true };
    }
    return { ok: false, errorData: result.data };
  }

  const value = {
    ...promitaniDto,
    handlerMap: { createItem, updateItem, deleteItem },
    reloadList: loadList,
  };

  return (
    <PromitaniContext.Provider value={value}>
      {children}
    </PromitaniContext.Provider>
  );
}

function comparePromitani(a, b) {
  const dateCompare = a.datum.localeCompare(b.datum);
  if (dateCompare !== 0) return dateCompare;
  return a.cas.localeCompare(b.cas);
}

export function usePromitani() {
  return useContext(PromitaniContext);
}

export default PromitaniProvider;
