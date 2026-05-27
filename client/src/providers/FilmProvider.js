import { createContext, useContext, useEffect, useState } from "react";
import FetchHelper from "../fetch-helper";

export const FilmContext = createContext();

const initialValue = {
  state: "pending",
  data: [],
  handlerMap: {},
  errorData: null,
};

function FilmProvider({ children }) {
  const [filmDto, setFilmDto] = useState(initialValue);

  async function loadList() {
    setFilmDto((current) => ({ ...current, state: "pending", errorData: null }));
    const result = await FetchHelper.film.list();
    setFilmDto((current) => {
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
    const result = await FetchHelper.film.create(dtoIn);
    if (result.ok) {
      setFilmDto((current) => ({
        ...current,
        state: "ready",
        data: [...current.data, result.data],
        errorData: null,
      }));
      return { ok: true };
    }
    return { ok: false, errorData: result.data };
  }

  async function updateItem(dtoIn) {
    const result = await FetchHelper.film.update(dtoIn);
    if (result.ok) {
      setFilmDto((current) => ({
        ...current,
        state: "ready",
        data: current.data.map((film) =>
          film.id === result.data.id ? result.data : film
        ),
        errorData: null,
      }));
      return { ok: true };
    }
    return { ok: false, errorData: result.data };
  }

  async function deleteItem(dtoIn) {
    const result = await FetchHelper.film.delete(dtoIn);
    if (result.ok) {
      setFilmDto((current) => ({
        ...current,
        state: "ready",
        data: current.data.filter((film) => film.id !== dtoIn.id),
        errorData: null,
      }));
      return { ok: true };
    }
    return { ok: false, errorData: result.data };
  }

  const value = {
    ...filmDto,
    handlerMap: { createItem, updateItem, deleteItem },
    reloadList: loadList,
  };

  return (
    <FilmContext.Provider value={value}>{children}</FilmContext.Provider>
  );
}

export function useFilm() {
  return useContext(FilmContext);
}

export default FilmProvider;
