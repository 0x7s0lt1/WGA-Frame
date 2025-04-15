"use client";
import {useContext} from "react";
import {HistoryContext} from "@/contexts/history-provider";

export default  function useHistory(){
    return useContext(HistoryContext);
}