"use client";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { Input } from "@base-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";


const page = () => {
  const [value,setValue]=useState("");
  const trpc=useTRPC();
  const {data: messages} = useQuery(trpc.messages.getMany.queryOptions());
  const createMessage=useMutation(trpc.messages.create.mutationOptions({
    onSuccess:()=>{
      toast.success("Message created");
    }
  }));
  return (
    <div className="p-4 max-w-7xl mx-auto ">
      <Input value={value} onChange={(e)=>setValue(e.target.value)} placeholder="Enter some text"/>
      <Button disabled={createMessage.isPending} onClick={()=>createMessage.mutate({value:value})}>
         Invoke Background Job</Button>
    </div>
    );
}

export default page 