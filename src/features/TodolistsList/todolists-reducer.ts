import { todolistsAPI, TodolistType } from "api/todolists-api";
import { Dispatch } from "redux";
import {
  appActions,
  RequestStatusType,
  SetAppErrorActionType,
  SetAppStatusActionType
} from "app/app-reducer";
import { handleServerNetworkError } from "utils/error-utils";
import { AppThunk } from "app/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { clearTasksAndTodolists } from "common/common.actions";

const initialState: Array<TodolistDomainType> = [];

const slice = createSlice({
  name: "todolists",
  initialState,
  reducers: {
    removeTodolist: (state, action: PayloadAction<{ id: string }>) => {
      const index = state.findIndex( tl => tl.id == action.payload.id)
      if(index !== -1) state.splice(index, 1)
    },
    addTodolist: (state, action: PayloadAction<{ todolist: TodolistType }>) => {
      const newTodolist: TodolistDomainType = {...action.payload.todolist, filter: "all", entityStatus: "idle" }
      state.unshift(newTodolist)
    },
    changeTodolistTitle: (state, action: PayloadAction<{ id: string, title: string }>) => {
      const todo = state.find( tl => tl.id == action.payload.id)
      if(todo) { todo.title = action.payload.title }
    },
    changeTodolistEntityStatus: (state, action: PayloadAction<{ id: string, entityStatus: RequestStatusType }>) => {
      const todo = state.find( tl => tl.id == action.payload.id)
      if(todo) { todo.entityStatus = action.payload.entityStatus }
    },
    changeTodolistFilter: (state, action: PayloadAction<{ id: string, filter: FilterValuesType}>) => {
      const todo = state.find( tl => tl.id == action.payload.id)
      if(todo) { todo.filter = action.payload.filter }
    },
    setTodolists: (state, action: PayloadAction<{ todolists: TodolistType[] }>) => {
      return action.payload.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
    },
  },
  extraReducers: (builder) => {
    builder.addCase(clearTasksAndTodolists, () => {
      return [];
    });
  },
})

export const todolistsReducer = slice.reducer;
export const todolistsActions = slice.actions;

// thunks
export const fetchTodolistsTC = (): AppThunk => {
  return (dispatch) => {
    dispatch(appActions.setAppStatus({status: "loading"}));
    todolistsAPI
      .getTodolists()
      .then((res) => {
        dispatch(todolistsActions.setTodolists({todolists: res.data}));
        dispatch(appActions.setAppStatus({status: "succeeded"}));
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch);
      });
  };
};
export const removeTodolistTC = (todolistId: string) => {
  return (dispatch: ThunkDispatch) => {
    //изменим глобальный статус приложения, чтобы вверху полоса побежала
    dispatch(appActions.setAppStatus({status: "loading"}));
    //изменим статус конкретного тудулиста, чтобы он мог задизеблить что надо
    dispatch(todolistsActions.changeTodolistEntityStatus({id: todolistId, entityStatus: "loading"}));
    todolistsAPI.deleteTodolist(todolistId).then((res) => {
      dispatch(todolistsActions.removeTodolist({id: todolistId}));
      //скажем глобально приложению, что асинхронная операция завершена
      dispatch(appActions.setAppStatus({status: "succeeded"}));
    });
  };
};
export const addTodolistTC = (title: string) => {
  return (dispatch: ThunkDispatch) => {
    dispatch(appActions.setAppStatus({status: "loading"}));
    todolistsAPI.createTodolist(title).then((res) => {
      dispatch(todolistsActions.addTodolist({todolist: res.data.data.item}));
      dispatch(appActions.setAppStatus({status: "succeeded"}));
    });
  };
};
export const changeTodolistTitleTC = (id: string, title: string) => {
  return (dispatch: Dispatch<ActionsType>) => {
    todolistsAPI.updateTodolist(id, title).then((res) => {
      dispatch(todolistsActions.changeTodolistTitle({id, title}));
    });
  };
};

// types
export type AddTodolistActionType = ReturnType<typeof todolistsActions.addTodolist>;
export type RemoveTodolistActionType = ReturnType<typeof todolistsActions.removeTodolist>;
export type SetTodolistsActionType = ReturnType<typeof todolistsActions.setTodolists>;
type ActionsType =
  | RemoveTodolistActionType
  | AddTodolistActionType
  | ReturnType<typeof todolistsActions.changeTodolistTitle>
  | ReturnType<typeof todolistsActions.changeTodolistFilter>
  | SetTodolistsActionType
  | ReturnType<typeof todolistsActions.changeTodolistEntityStatus>;
export type FilterValuesType = "all" | "active" | "completed";
export type TodolistDomainType = TodolistType & {
  filter: FilterValuesType;
  entityStatus: RequestStatusType;
};
type ThunkDispatch = Dispatch<ActionsType | SetAppStatusActionType | SetAppErrorActionType>;
