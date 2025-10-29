import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CompaniesQuery } from "@/types/companies";

type Props = { filters: CompaniesQuery; onSave: (name:string)=>Promise<void> };

export default function SaveViewDialog({ filters, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  async function handleSave() {
    await onSave(name);
    setOpen(false);
    setName("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline">Save View</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Current Filters</DialogTitle>
        </DialogHeader>
        <Input placeholder="View name" value={name} onChange={e=>setName(e.target.value)} />
        <DialogFooter>
          <Button disabled={!name.trim()} onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

