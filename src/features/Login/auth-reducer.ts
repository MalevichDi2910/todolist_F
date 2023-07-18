import { Dispatch } from "redux";
import { appActions, SetAppErrorActionType, SetAppStatusActionType } from "app/app-reducer";
import { authAPI, LoginParamsType } from "api/todolists-api";
import { handleServerAppError, handleServerNetworkError } from "utils/error-utils";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { todolistsActions } from "features/TodolistsList/todolists-reducer";
import { clearTasksAndTodolists } from "common/common.actions";
import { AppThunk } from "app/store";

const initialState: InitialStateType = {
  isLoggedIn: false,
};

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setIsLoggedIn: (state, action: PayloadAction<{ isLoggedIn: boolean }>) => {
      state.isLoggedIn = action.payload.isLoggedIn;
    }
  }
});

export const authReducer = slice.reducer;
export const authActions = slice.actions;

// thunks
export const loginTC =
  (data: LoginParamsType) => (dispatch: Dispatch<ActionsType | SetAppStatusActionType | SetAppErrorActionType>) => {
    dispatch(appActions.setAppStatus({status: "loading"}));
    authAPI
      .login(data)
      .then((res) => {
        if (res.data.resultCode === 0) {
          dispatch(authActions.setIsLoggedIn({isLoggedIn: true}));
          dispatch(appActions.setAppStatus({status: "succeeded"}));
        } else {
          handleServerAppError(res.data, dispatch);
        }
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch);
      });
  };
export const logoutTC = () : AppThunk => (dispatch) => {
  dispatch(appActions.setAppStatus({status: "loading"}));
  authAPI
    .logout()
    .then((res) => {
      if (res.data.resultCode === 0) {
        dispatch(authActions.setIsLoggedIn({isLoggedIn: false}));
        dispatch(clearTasksAndTodolists());
        dispatch(appActions.setAppStatus({status:"succeeded"}));
      } else {
        handleServerAppError(res.data, dispatch);
      }
    })
    .catch((error) => {
      handleServerNetworkError(error, dispatch);
    });
};

// types

type ActionsType = ReturnType<typeof authActions.setIsLoggedIn>;
type InitialStateType = {
  isLoggedIn: boolean;
};

type ThunkDispatch = Dispatch<ActionsType | SetAppStatusActionType | SetAppErrorActionType>;
