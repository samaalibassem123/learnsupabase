"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [todo, setTodo] = useState([]);

  const createTodo = async () => {
    const { data, error } = await supabase
      .from("List")
      .insert({ text: "hello hey" });

    if (error) {
      console.error("Error inserting data:", error);
    } else {
      console.log("Product added:", data);
    }
  };

  const deleteTodo = async (id) => {
    const { data, error } = await supabase.from("List").delete().eq("id", id);

    if (error) {
      console.error("Error deleting data:", error);
    } else {
      console.log("Product deleted:", data);
    }
  };

  useEffect(() => {
    const fetchList = async () => {
      const { data, error } = await supabase.from("List").select("*"); // Fetch all columns
      if (error) {
        console.error("Error fetching data:", error);
      } else {
        console.log("Products:", data);
        setTodo(data);
      }
    };
    fetchList();
    //Set up realtime subscription
    const subscription = supabase
      .channel("List")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "List" },
        (payload) => {
          setTodo((tab) => [...tab, payload.new]);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "List" },
        (payload) => {
          setTodo((tab) => tab.filter((todol) => todol.id !== payload.old.id));
        }
      )
      .subscribe();
  }, []);
  return (
    <div className="flex flex-col justify-center items-center min-h-svh w-full">
      <div className=" space-y-3">
        <Label>To Do : </Label>
        <div className="flex  gap-2 ">
          <Input />
          <Button onClick={createTodo} type="button">
            submit
          </Button>
        </div>
      </div>

      <div>
        {/* Lists */}
        {todo.map((list) => (
          <div className="flex justify-between gap-10 border m-2 p-5 rounded-sm">
            <p key={list.id}>{list.text}</p>
            <span>{list.created_at}</span>
            <Button onClick={() => deleteTodo(list.id)}>Delete</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
