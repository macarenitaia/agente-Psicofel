from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
import os

@CrewBase
class ClinicaPsicologiaCrew():
    """Crew de Triaje para Clínica de Psicología"""
    agents_config = 'config/agents.yaml'
    tasks_config = 'config/tasks.yaml'

    @agent
    def triage_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['triage_agent'],
            verbose=True,
            allow_delegation=False
        )

    @task
    def triage_task(self) -> Task:
        return Task(
            config=self.tasks_config['triage_task'],
        )

    @task
    def derivation_task(self) -> Task:
        return Task(
            config=self.tasks_config['derivation_task'],
        )

    @crew
    def crew(self) -> Crew:
        """Crea la tripulación de triaje"""
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
        )

if __name__ == "__main__":
    # Prueba rápida (esto se integrará en la API después)
    inputs = {
        'current_year': '2026'
    }
    result = ClinicaPsicologiaCrew().crew().kickoff(inputs=inputs)
    print(f"Resultado del Triaje: {result}")
