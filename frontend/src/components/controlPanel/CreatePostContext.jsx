import React, { createContext, useContext } from "react";

const CreatePostContext = createContext(null);

export const CreatePostProvider = ({ children, openCreatePost, closeCreatePost, createPostOpen }) => {
  return (
    <CreatePostContext.Provider value={{ openCreatePost, closeCreatePost, createPostOpen }}>
      {children}
    </CreatePostContext.Provider>
  );
};

export const useCreatePost = () => useContext(CreatePostContext);
