const profileName = document.getElementById('profile-name');
const profileTitle = document.getElementById('profile-title');
const profileSummary = document.getElementById('profile-summary');
const skillsEl = document.getElementById('skills');
const projectsEl = document.getElementById('projects');
const projectForm = document.getElementById('project-form');
const projectIdInput = document.getElementById('project-id');
const projectTitleInput = document.getElementById('project-title');
const projectDescriptionInput = document.getElementById('project-description');
const projectTagsInput = document.getElementById('project-tags');
const projectUrlInput = document.getElementById('project-url');
const saveProjectButton = document.getElementById('save-project');
const cancelEditButton = document.getElementById('cancel-edit');

const renderSkills = (skills) => {
  skillsEl.innerHTML = skills
    .map((skill) => `<span class="chip">${skill.name}</span>`)
    .join('');
};

const renderProjects = (projects) => {
  if (!projects.length) {
    projectsEl.innerHTML = '<p>No projects found yet. Add one using the form above.</p>';
    return;
  }

  projectsEl.innerHTML = projects
    .map(
      (project) => `
        <article class="card">
          <h3>${project.title}</h3>
          <p>${project.description}</p>
          <div class="tags">
            ${project.tags.split(',').map((tag) => `<span class="tag">${tag.trim()}</span>`).join('')}
          </div>
          <div class="project-actions">
            ${project.url ? `<a href="${project.url}" target="_blank" rel="noreferrer">View project</a>` : ''}
            <div class="action-buttons">
              <button type="button" class="button secondary edit-button" data-id="${project.id}">Edit</button>
              <button type="button" class="button danger delete-button" data-id="${project.id}">Delete</button>
            </div>
          </div>
        </article>
      `
    )
    .join('');
};

const resetForm = () => {
  projectIdInput.value = '';
  projectTitleInput.value = '';
  projectDescriptionInput.value = '';
  projectTagsInput.value = '';
  projectUrlInput.value = '';
  saveProjectButton.textContent = 'Add project';
  cancelEditButton.classList.add('hidden');
};

const fillForm = (project) => {
  projectIdInput.value = project.id;
  projectTitleInput.value = project.title;
  projectDescriptionInput.value = project.description;
  projectTagsInput.value = project.tags;
  projectUrlInput.value = project.url || '';
  saveProjectButton.textContent = 'Update project';
  cancelEditButton.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const fetchProjects = async () => {
  try {
    const response = await fetch('/api/projects');
    const projects = await response.json();
    renderProjects(projects);
  } catch (error) {
    console.error('Error loading projects:', error);
    projectsEl.innerHTML = '<p>Unable to load projects right now. Please try again later.</p>';
  }
};

const fetchData = async () => {
  try {
    const [profileRes, skillsRes] = await Promise.all([
      fetch('/api/profile'),
      fetch('/api/skills')
    ]);

    const profile = await profileRes.json();
    const skills = await skillsRes.json();

    profileName.textContent = profile.name;
    profileTitle.textContent = profile.title;
    profileSummary.textContent = profile.summary;

    renderSkills(skills);
    await fetchProjects();
  } catch (error) {
    console.error('Error loading portfolio data:', error);
    projectsEl.innerHTML = '<p>Unable to load projects right now. Please try again later.</p>';
  }
};

projectForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const id = projectIdInput.value;
  const projectData = {
    title: projectTitleInput.value,
    description: projectDescriptionInput.value,
    tags: projectTagsInput.value,
    url: projectUrlInput.value
  };

  try {
    const response = await fetch(id ? `/api/projects/${id}` : '/api/projects', {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Unable to save project.');
    }

    resetForm();
    await fetchProjects();
  } catch (error) {
    console.error('Project save failed:', error);
    alert(error.message);
  }
});

cancelEditButton.addEventListener('click', resetForm);

projectsEl.addEventListener('click', async (event) => {
  const id = event.target.dataset.id;

  if (event.target.matches('.edit-button')) {
    try {
      const response = await fetch('/api/projects');
      const projects = await response.json();
      const project = projects.find((item) => item.id.toString() === id);
      if (project) fillForm(project);
    } catch (error) {
      console.error('Unable to load project for editing:', error);
      alert('Unable to load project for editing.');
    }
  }

  if (event.target.matches('.delete-button')) {
    if (!confirm('Delete this project?')) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok && response.status !== 204) {
        const error = await response.json();
        throw new Error(error.error || 'Unable to delete project.');
      }
      await fetchProjects();
      if (projectIdInput.value === id) {
        resetForm();
      }
    } catch (error) {
      console.error('Unable to delete project:', error);
      alert(error.message);
    }
  }
});

resetForm();
fetchData();
