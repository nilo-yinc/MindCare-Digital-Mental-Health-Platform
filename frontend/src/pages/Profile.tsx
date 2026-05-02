import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export function Profile() {
  const { user, token, refreshProfile, updateProfile, logout } = useAuth() as any;
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState<string | undefined>(user?.avatar);
  const [proTitle, setProTitle] = useState((user && user.professional && user.professional.title) || '');
  const [proOrg, setProOrg] = useState((user && user.professional && user.professional.organization) || '');
  const [proBio, setProBio] = useState((user && user.professional && user.professional.bio) || '');
  const [proSkills, setProSkills] = useState((user && user.professional && (user.professional.skills || []).join(', ')) || '');

  const [personalDob, setPersonalDob] = useState((user && user.personal && user.personal.dob) ? new Date(user.personal.dob).toISOString().slice(0,10) : '');
  const [personalPronouns, setPersonalPronouns] = useState((user && user.personal && user.personal.pronouns) || '');
  const [personalInterests, setPersonalInterests] = useState((user && user.personal && (user.personal.interests || []).join(', ')) || '');
  const [personalLocation, setPersonalLocation] = useState((user && user.personal && user.personal.location) || '');
  const [personalAbout, setPersonalAbout] = useState((user && user.personal && user.personal.about) || '');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatar(user.avatar);
    }
  }, [user]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Please upload an image below 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        name,
        avatar,
        professional: {
          title: proTitle,
          organization: proOrg,
          bio: proBio,
          skills: proSkills.split(',').map((s: string) => s.trim()).filter(Boolean),
        },
        personal: {
          dob: personalDob || undefined,
          pronouns: personalPronouns,
          interests: personalInterests.split(',').map((s: string) => s.trim()).filter(Boolean),
          location: personalLocation,
          about: personalAbout,
        }
      });
      toast.success('Profile saved');
      refreshProfile();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-4">Your Profile</h1>
      <div className="bg-[#141C24] p-6 rounded-2xl border border-white/5">
        <div className="flex gap-6 mb-6 items-start">
          <div className="w-28 h-28 rounded-full overflow-hidden border border-white/10">
            {avatar ? <img src={avatar} alt="avatar" className="w-full h-full object-cover"/> : <div className="w-full h-full bg-white/10"/>}
          </div>
          <div>
            <div className="mb-2 text-sm text-slate-400">Name</div>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-[#0A0F14] border border-white/10 text-white" />
            <div className="mt-3">
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border border-white/20 text-slate-200 hover:bg-white/10 cursor-pointer">
                Upload Photo
                <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-2">Professional</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <input value={proTitle} onChange={(e) => setProTitle(e.target.value)} placeholder="Title" className="px-3 py-2 rounded-xl bg-[#0A0F14] border border-white/10 text-white" />
          <input value={proOrg} onChange={(e) => setProOrg(e.target.value)} placeholder="Organization" className="px-3 py-2 rounded-xl bg-[#0A0F14] border border-white/10 text-white" />
          <input value={proSkills} onChange={(e) => setProSkills(e.target.value)} placeholder="Skills (comma separated)" className="px-3 py-2 rounded-xl bg-[#0A0F14] border border-white/10 text-white md:col-span-2" />
          <textarea value={proBio} onChange={(e) => setProBio(e.target.value)} placeholder="Short bio" className="px-3 py-2 rounded-xl bg-[#0A0F14] border border-white/10 text-white md:col-span-2" />
        </div>

        <h3 className="text-lg font-semibold mb-2">Personal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <input type="date" value={personalDob} onChange={(e) => setPersonalDob(e.target.value)} className="px-3 py-2 rounded-xl bg-[#0A0F14] border border-white/10 text-white" />
          <input value={personalPronouns} onChange={(e) => setPersonalPronouns(e.target.value)} placeholder="Pronouns" className="px-3 py-2 rounded-xl bg-[#0A0F14] border border-white/10 text-white" />
          <input value={personalInterests} onChange={(e) => setPersonalInterests(e.target.value)} placeholder="Interests (comma separated)" className="px-3 py-2 rounded-xl bg-[#0A0F14] border border-white/10 text-white md:col-span-2" />
          <input value={personalLocation} onChange={(e) => setPersonalLocation(e.target.value)} placeholder="Location" className="px-3 py-2 rounded-xl bg-[#0A0F14] border border-white/10 text-white" />
          <textarea value={personalAbout} onChange={(e) => setPersonalAbout(e.target.value)} placeholder="About you" className="px-3 py-2 rounded-xl bg-[#0A0F14] border border-white/10 text-white md:col-span-2" />
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-[#00F5D4] text-[#0A0F14] font-semibold">Save Profile</button>
          <button onClick={() => { logout(); navigate('/'); }} className="px-4 py-2 rounded-xl border border-white/10 text-white">Logout</button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
