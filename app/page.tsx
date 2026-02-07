"use client";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { Input } from "@base-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";


const page = () => {
  const [value,setValue]=useState("");
  const trpc=useTRPC();
  const invoke=useMutation(trpc.invoke.mutationOptions({
    onSuccess:()=>{
      toast.success("Background Job Invoked!");
    }
  }));
  return (
    <div className="p-4 max-w-7xl mx-auto ">
      <Input value={value} onChange={(e)=>setValue(e.target.value)} placeholder="Enter some text"/>
      <Button disabled={invoke.isPending} onClick={()=>invoke.mutate({value:value})}>
         Invoke Background Job</Button>
    </div>
    );
}

export default page 